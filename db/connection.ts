import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env' : `.env.${nodeEnv}`;

dotenv.config({ path: envFile });
dotenv.config();

// Lazy load Sequelize to avoid loading pg during build time
let sequelizeInstance: any = null;
let isBuildTime = false;

// Detect if we're in Next.js build phase
try {
  // During build, Next.js sets certain conditions
  // Check if we're in a build context by looking for build-time indicators
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PHASE === 'phase-development-build' ||
      !process.env.DATABASE_URL) {
    isBuildTime = true;
  }
} catch {
  isBuildTime = true;
}

// Create a dummy object for build time
const createDummySequelize = () => ({
  authenticate: async () => {},
  transaction: async (callback: any) => callback({}),
  query: async () => [],
  define: () => ({
    init: () => {},
    associate: () => {},
    findOne: async () => null,
    findAll: async () => [],
    findByPk: async () => null,
    create: async () => ({}),
    update: async () => [0],
    destroy: async () => 0,
  }),
});

const getSequelize = () => {
  // During build, return a dummy object that satisfies model initialization
  if (isBuildTime) {
    return createDummySequelize();
  }

  if (!sequelizeInstance) {
    try {
      // Use require() instead of import to avoid loading during build
      // This ensures Sequelize and pg are only loaded at runtime
      const { Sequelize } = require('sequelize');
      
      sequelizeInstance = new Sequelize(process.env.DATABASE_URL!, {
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
      // If require fails with pg error (e.g., during build), mark as build time
      if (error?.message?.includes('pg') || error?.message?.includes('Please install')) {
        isBuildTime = true;
        return createDummySequelize();
      }
      // For other errors, still return dummy but log warning
      console.warn('Sequelize initialization skipped:', error);
      return createDummySequelize();
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

// Export as a Proxy that safely handles build-time access
// If Sequelize fails to load (e.g., during build), return dummy object
const sequelize = new Proxy({} as any, {
  get(_target, prop) {
    try {
      const instance = getSequelize();
      return instance[prop];
    } catch (error: any) {
      // If we get an error about pg or Sequelize, return dummy methods for build
      if (error?.message?.includes('pg') || error?.message?.includes('Sequelize')) {
        const dummy = createDummySequelize();
        return dummy[prop as keyof typeof dummy];
      }
      throw error;
    }
  }
});

export default sequelize;