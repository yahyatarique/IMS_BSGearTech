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
    // Optimize pool for serverless + Supabase nano tier
    // Nano tier: 60 direct connections, 200 pooled connections limit
    // For serverless, we want minimal pooling since Supabase handles it
    // Transaction mode pooler (port 6543) requires different settings than session mode
    pool: {
      max: 1,        // One connection per function invocation (conservative for nano tier)
      min: 0,        // Allow pool to shrink to 0
      idle: 0,       // Close idle connections immediately
      acquire: 20000, // Longer timeout for nano tier (20 seconds)
      evict: 5000,   // Clean up quickly (5 seconds)
      handleDisconnects: true, // Automatically reconnect on disconnect
      // For transaction mode pooler, we need to be more careful
      ...(isPooler && {
        // Additional settings for transaction mode pooler
        validate: (client: any) => {
          // Quick validation - just check if client exists
          return client !== null && client !== undefined;
        }
      })
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

export const testConnection = async (retries = 5): Promise<boolean> => {
  try {
    // Check DATABASE_URL first
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return false;
    }

    // Parse DATABASE_URL to understand connection type
    const dbUrl = process.env.DATABASE_URL;
    const isTransactionMode = dbUrl.includes(':6543') || dbUrl.includes('pgbouncer=true');
    const isSessionMode = dbUrl.includes(':5432') && !dbUrl.includes('pooler');
    
    console.log(`Database connection type: ${isTransactionMode ? 'Transaction Mode (6543)' : isSessionMode ? 'Session Mode (5432)' : 'Direct Connection'}`);

    // Get a fresh sequelize instance for each attempt to avoid stale connections
    // In serverless, we want a new connection each time
    let sequelize: any;
    try {
      // Force a new instance by clearing the cached one
      sequelizeInstance = null;
      sequelize = getSequelize();
    } catch (initError: any) {
      console.error('Failed to initialize Sequelize:', initError.message);
      return false;
    }
    
    // For nano tier, use shorter timeout per attempt but more retries
    // Transaction mode pooler can be slower, so we adjust timeout
    const timeout = isTransactionMode ? 10000 : 8000; // 10s for transaction mode, 8s for session
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`Connection attempt ${attempt + 1}/${retries + 1}...`);
        
        await Promise.race([
          sequelize.authenticate(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Connection timeout after ${timeout}ms`)), timeout)
          )
        ]);
        
        console.log('Database connection has been established successfully.');
        return true;
      } catch (authError: any) {
        const errorDetails = {
          message: authError?.message || String(authError),
          name: authError?.name || 'Unknown',
          code: authError?.code || 'N/A',
          errno: authError?.errno || 'N/A',
          syscall: authError?.syscall || 'N/A',
          hostname: authError?.hostname || 'N/A',
          port: authError?.port || 'N/A'
        };
        
        console.error(`Connection attempt ${attempt + 1} failed:`, errorDetails);
        
        // Check if we should retry
        const shouldRetry = attempt < retries && (
          authError?.code === 'ETIMEDOUT' || 
          authError?.code === 'ECONNREFUSED' ||
          authError?.code === 'ENOTFOUND' ||
          authError?.code === 'ECONNRESET' ||
          authError?.code === 'EAI_AGAIN' ||
          authError?.message?.includes('timeout') ||
          authError?.message?.includes('too many connections') ||
          authError?.message?.includes('connection') ||
          authError?.message?.includes('ECONN') ||
          authError?.message?.includes('ENOTFOUND')
        );
        
        if (shouldRetry) {
          // Close existing connection before retry to free up resources
          try {
            if (sequelize && typeof sequelize.close === 'function') {
              await sequelize.close();
            }
          } catch (closeError: any) {
            // Ignore close errors - connection might already be closed
            console.log('Connection close warning (ignored):', closeError.message);
          }
          
          // Exponential backoff: 500ms, 1s, 2s, 4s, 8s
          const delay = Math.min(Math.pow(2, attempt) * 500, 8000);
          console.log(`Retrying connection in ${delay}ms... (${retries - attempt} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Create a new sequelize instance for the retry
          try {
            sequelizeInstance = null;
            sequelize = getSequelize();
          } catch (e: any) {
            console.error('Failed to reinitialize Sequelize for retry:', e.message);
            // Continue with existing instance if reinit fails
          }
        } else {
          // Don't retry - log final error
          const finalErrorDetails = {
            ...errorDetails,
            stack: authError?.stack || 'No stack trace'
          };
          console.error('Unable to connect to the database after all retries:', finalErrorDetails);
          return false;
        }
      }
    }
    
    return false;
  } catch (error: any) {
    const errorDetails = {
      message: error?.message || String(error),
      name: error?.name || 'Unknown',
      code: error?.code || 'N/A',
      errno: error?.errno || 'N/A',
      syscall: error?.syscall || 'N/A',
      hostname: error?.hostname || 'N/A',
      port: error?.port || 'N/A',
      stack: error?.stack || 'No stack trace'
    };
    
    console.error('Unexpected error in testConnection:', errorDetails);
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