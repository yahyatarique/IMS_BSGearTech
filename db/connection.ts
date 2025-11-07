import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env' : `.env.${nodeEnv}`;

dotenv.config({ path: envFile });
dotenv.config();

// Lazy load Sequelize to avoid loading pg during build phase
let sequelizeInstance: any = null;
let SequelizeClass: any = null;

const getSequelize = () => {
  if (!sequelizeInstance) {
    try {
      // Use require() instead of import to avoid loading during build
      if (!SequelizeClass) {
        SequelizeClass = require('sequelize').Sequelize;
      }
      
      sequelizeInstance = new SequelizeClass(process.env.DATABASE_URL!, {
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
    } catch (error: any) {
      // During build, pg might not be available - this is expected
      if (error?.message?.includes('pg') || error?.message?.includes('Please install')) {
        console.warn('Sequelize initialization deferred to runtime');
        // Return a proxy that will initialize on first use
        return new Proxy({}, {
          get(_target, prop) {
            // Initialize on first property access
            if (!sequelizeInstance) {
              SequelizeClass = require('sequelize').Sequelize;
              sequelizeInstance = new SequelizeClass(process.env.DATABASE_URL!, {
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
            }
            return sequelizeInstance[prop];
          }
        });
      }
      throw error;
    }
  }
  return sequelizeInstance;
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