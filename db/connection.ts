import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env' : `.env.${nodeEnv}`;

dotenv.config({ path: envFile });
dotenv.config();

// Lazy load Sequelize to avoid loading pg during build time
let sequelizeInstance: any = null;

const getSequelize = () => {
  // Skip initialization during build (when DATABASE_URL might not be available)
  if (typeof process.env.DATABASE_URL === 'undefined') {
    // Return a dummy object during build to prevent errors
    return {
      authenticate: async () => {},
      transaction: async (callback: any) => callback({}),
      query: async () => [],
    } as any;
  }

  if (!sequelizeInstance) {
    // Use require() instead of import to avoid loading during build
    // This ensures Sequelize and pg are only loaded at runtime
    const { Sequelize } = require('sequelize');
    
    sequelizeInstance = new Sequelize(process.env.DATABASE_URL, {
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

// Export as a getter property so it behaves like the instance but initializes lazily
const sequelize = new Proxy({} as any, {
  get(_target, prop) {
    return getSequelize()[prop];
  }
});

export default sequelize;