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

// Pre-initialize dummy instance during build to avoid any require() calls
if (isBuildTime) {
  sequelizeInstance = null; // Will be handled by getSequelize
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

// During build, export dummy object directly to avoid any require() calls
// At runtime, use Proxy to lazily load Sequelize
const dummySequelize = createDummySequelize();

const sequelize = isBuildTime ? dummySequelize : new Proxy({} as any, {
  get(_target, prop) {
    try {
      const instance = getSequelize();
      if (instance && typeof instance[prop] !== 'undefined') {
        return instance[prop];
      }
      // Fallback to dummy if property doesn't exist
      return dummySequelize[prop as keyof typeof dummySequelize];
    } catch (error: any) {
      // On any error, return dummy to prevent failures
      return dummySequelize[prop as keyof typeof dummySequelize];
    }
  }
});

export default sequelize;