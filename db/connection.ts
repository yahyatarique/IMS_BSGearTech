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

// Create dummy instance early so it can be referenced
const dummySequelize = createDummySequelize();

const getSequelize = () => {
  // During build, return a dummy object that satisfies model initialization
  if (isBuildTime) {
    return dummySequelize;
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
      // If require fails (e.g., during build when pg can't load), return dummy
      // This catches the "Please install pg package manually" error
      if (error?.message?.includes('pg') || error?.message?.includes('Please install')) {
        isBuildTime = true;
        return dummySequelize;
      }
      // For other errors, still return dummy but log warning
      console.warn('Sequelize initialization skipped:', error?.message || error);
      return dummySequelize;
    }
  }
  return sequelizeInstance || dummySequelize;
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

// Always start with dummy to prevent build-time errors
// Switch to real Sequelize only when successfully loaded at runtime
let realSequelizeLoaded = false;

const sequelize = new Proxy(dummySequelize, {
  get(target, prop) {
    // If we haven't tried loading real Sequelize yet, try now
    if (!realSequelizeLoaded) {
      try {
        const instance = getSequelize();
        // If we got a real instance (not dummy), use it
        if (instance && instance !== dummySequelize) {
          realSequelizeLoaded = true;
          // Replace the target with the real instance
          Object.setPrototypeOf(target, instance);
          return instance[prop as keyof typeof instance];
        }
      } catch (error: any) {
        // On any error, continue using dummy
        // Don't mark as loaded so we can retry later
      }
    }
    
    // Return from current target (dummy or real)
    return target[prop as keyof typeof target];
  }
});

export default sequelize;