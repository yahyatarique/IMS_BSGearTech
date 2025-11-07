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
  
  // Try to initialize - if it fails during build, return a proxy
  try {
    sequelizeInstance = createSequelizeInstance();
    return sequelizeInstance;
  } catch (error: any) {
    // During build or if pg is not available, return a proxy
    const errorMessage = error?.message || '';
    if (
      errorMessage.includes('pg') || 
      errorMessage.includes('Please install') ||
      errorMessage.includes('Cannot find module') ||
      !process.env.DATABASE_URL
    ) {
      // Return a proxy that initializes on first actual use
      return new Proxy({} as any, {
        get(_target, prop) {
          // Initialize on first property access (should work at runtime)
          if (!sequelizeInstance) {
            try {
              sequelizeInstance = createSequelizeInstance();
            } catch (e: any) {
              console.error('Failed to initialize Sequelize:', e.message);
              // If it's a method call, return a function that will retry
              if (typeof prop === 'string' && (prop === 'define' || prop === 'authenticate' || prop === 'query' || prop === 'transaction')) {
                return async (...args: any[]) => {
                  if (!sequelizeInstance) {
                    sequelizeInstance = createSequelizeInstance();
                  }
                  const method = sequelizeInstance[prop];
                  if (typeof method === 'function') {
                    return method.apply(sequelizeInstance, args);
                  }
                  return method;
                };
              }
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
    // Re-throw other errors
    throw error;
  }
};

export const testConnection = async () => {
  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

// Export a getter that initializes on first access
export default new Proxy({} as any, {
  get(_target, prop) {
    return getSequelize()[prop];
  }
});