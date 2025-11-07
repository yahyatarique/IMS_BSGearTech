import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env' : `.env.${nodeEnv}`;

dotenv.config({ path: envFile });
dotenv.config();

// Lazy load Sequelize to avoid loading pg during build phase
let sequelizeInstance: any = null;
let SequelizeClass: any = null;
let initializationError: any = null;

const createSequelizeInstance = () => {
  if (!SequelizeClass) {
    SequelizeClass = require('sequelize').Sequelize;
  }
  
  return new SequelizeClass(process.env.DATABASE_URL!, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
};

const getSequelize = () => {
  if (sequelizeInstance) {
    return sequelizeInstance;
  }
  
  // If we had an error before, try again (might be runtime now)
  if (initializationError) {
    initializationError = null;
  }
  
  try {
    sequelizeInstance = createSequelizeInstance();
    return sequelizeInstance;
  } catch (error: any) {
    initializationError = error;
    // During build, pg might not be available - return a proxy that initializes on use
    if (error?.message?.includes('pg') || error?.message?.includes('Please install')) {
      console.warn('Sequelize initialization deferred to runtime');
      // Return a proxy that will initialize on first actual use
      return new Proxy({} as any, {
        get(_target, prop) {
          // Try to initialize on first property access
          if (!sequelizeInstance) {
            try {
              sequelizeInstance = createSequelizeInstance();
              return sequelizeInstance[prop];
            } catch (e: any) {
              // If still failing, return a function that will retry
              if (prop === 'define' || prop === 'authenticate' || prop === 'query') {
                return (...args: any[]) => {
                  // Initialize now (should work at runtime)
                  if (!sequelizeInstance) {
                    sequelizeInstance = createSequelizeInstance();
                  }
                  return sequelizeInstance[prop](...args);
                };
              }
              throw e;
            }
          }
          return sequelizeInstance[prop];
        }
      });
    }
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