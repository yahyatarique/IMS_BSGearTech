require('dotenv').config();


const config = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Update paths for new structure
    migrationsPath: 'src/db/migrations',
    seedersPath: 'src/db/seeders',
    modelsPath: 'src/db/models'
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    migrationsPath: 'src/db/migrations',
    seedersPath: 'src/db/seeders',
    modelsPath: 'src/db/models'
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    migrationsPath: 'src/db/migrations',
    seedersPath: 'src/db/seeders',
    modelsPath: 'src/db/models'
  }
};

module.exports = config;
