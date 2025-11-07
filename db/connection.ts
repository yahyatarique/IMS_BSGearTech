import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env' : `.env.${nodeEnv}`;

dotenv.config({ path: envFile });
dotenv.config();

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set!');
}

// Lazy load Sequelize to avoid loading pg during build phase
let sequelizeInstance: any = null;
let SequelizeClass: any = null;

const createSequelizeInstance = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required but not set');
  }
  
  if (!SequelizeClass) {
    SequelizeClass = require('sequelize').Sequelize;
  }
  
  // Parse DATABASE_URL to check if it's using Supabase pooler
  const isPooler = process.env.DATABASE_URL.includes('pooler.supabase.com') || 
                   process.env.DATABASE_URL.includes('pgbouncer=true');
  
  return new SequelizeClass(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      // Disable prepared statements for Supabase transaction mode pooler
      // This is required when using pgbouncer=true or port 6543
      ...(isPooler && {
        statement_timeout: 0,
        query_timeout: 0,
        // Force disable prepared statements
        prepare: false
      })
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // Optimize pool for serverless (Supabase handles pooling)
    pool: {
      max: 1,        // One connection per function invocation
      min: 0,        // Allow pool to shrink to 0
      idle: 0,       // Close idle connections immediately
      acquire: 3000, // Fail fast (3 seconds)
      evict: 10000   // Clean up after 10s (Vercel default timeout)
    }
  });
};

const getSequelize = () => {
  if (sequelizeInstance) {
    return sequelizeInstance;
  }
  
  // If DATABASE_URL is available, try to initialize immediately
  // This is needed for Model.init() calls at module load time
  if (process.env.DATABASE_URL) {
    try {
      sequelizeInstance = createSequelizeInstance();
      return sequelizeInstance;
    } catch (error: any) {
      // Only use proxy if pg is not available (build-time)
      const errorMessage = error?.message || '';
      if (
        errorMessage.includes('pg') || 
        errorMessage.includes('Please install') ||
        errorMessage.includes('Cannot find module')
      ) {
        // During build, pg might not be available - return proxy for runtime
        console.warn('Sequelize initialization deferred (pg not available during build)');
        return new Proxy({} as any, {
          get(_target, prop) {
            // Initialize on first property access (should work at runtime)
            if (!sequelizeInstance) {
              try {
                sequelizeInstance = createSequelizeInstance();
              } catch (e: any) {
                console.error('Failed to initialize Sequelize at runtime:', e.message);
                throw e;
              }
            }
            const value = sequelizeInstance[prop];
            // If it's a function, bind it to the instance
            if (typeof value === 'function') {
              return value.bind(sequelizeInstance);
            }
            return value;
          }
        });
      }
      // Re-throw other errors (like connection failures)
      throw error;
    }
  }
  
  // No DATABASE_URL - return proxy that will fail at runtime with clear error
  throw new Error('DATABASE_URL environment variable is required but not set');
};

export const testConnection = async () => {
  try {
    // Check DATABASE_URL first
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return false;
    }

    const sequelize = getSequelize();
    
    // Test connection with timeout
    await Promise.race([
      sequelize.authenticate(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 5 seconds')), 5000)
      )
    ]);
    
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error: any) {
    console.error('Unable to connect to the database:', {
      message: error?.message || String(error),
      name: error?.name || 'Unknown',
      code: error?.code || 'N/A',
      errno: error?.errno || 'N/A',
      syscall: error?.syscall || 'N/A',
      hostname: error?.hostname || 'N/A',
      port: error?.port || 'N/A',
      stack: error?.stack || 'No stack trace'
    });
    return false;
  }
};

// Export sequelize instance
// For Model.init() calls at module load time, we need the actual instance
// The lazy loading happens in getSequelize() which handles build-time vs runtime
let exportedSequelize: any = null;

// Try to initialize immediately if DATABASE_URL is available
// This ensures Model.init() works correctly
if (process.env.DATABASE_URL) {
  try {
    exportedSequelize = getSequelize();
  } catch (error: any) {
    // If initialization fails (e.g., during build), use Proxy
    const errorMessage = error?.message || '';
    if (errorMessage.includes('pg') || errorMessage.includes('Please install') || errorMessage.includes('Cannot find module')) {
      // Use Proxy for build-time compatibility
      exportedSequelize = new Proxy({} as any, {
        get(_target, prop) {
          // Initialize on first access
          if (!sequelizeInstance) {
            try {
              sequelizeInstance = createSequelizeInstance();
            } catch (e: any) {
              console.error('Failed to initialize Sequelize:', e.message);
              throw e;
            }
          }
          const value = sequelizeInstance[prop];
          if (typeof value === 'function') {
            return value.bind(sequelizeInstance);
          }
          return value;
        }
      });
    } else {
      // Re-throw connection errors
      throw error;
    }
  }
} else {
  // No DATABASE_URL - use Proxy that will initialize at runtime
  exportedSequelize = new Proxy({} as any, {
    get(_target, prop) {
      if (!sequelizeInstance) {
        sequelizeInstance = createSequelizeInstance();
      }
      const value = sequelizeInstance[prop];
      if (typeof value === 'function') {
        return value.bind(sequelizeInstance);
      }
      return value;
    }
  });
}

export default exportedSequelize;