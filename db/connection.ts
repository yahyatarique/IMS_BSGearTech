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

const getSequelize = () => {
  // During build, return a dummy object that satisfies model initialization
  if (isBuildTime) {
    return {
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
    } as any;
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
    } catch (error) {
      // If require fails (e.g., during build), return dummy object
      console.warn('Sequelize initialization skipped:', error);
      return {
        authenticate: async () => {},
        transaction: async (callback: any) => callback({}),
        query: async () => [],
        define: () => ({
          init: () => {},
          associate: () => {},
        }),
      } as any;
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

// Export as a getter property so it behaves like the instance but initializes lazily
// During build, return dummy methods without calling getSequelize to avoid loading pg
const sequelize = isBuildTime ? {
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
} as any : new Proxy({} as any, {
  get(_target, prop) {
    return getSequelize()[prop];
  }
});

export default sequelize;