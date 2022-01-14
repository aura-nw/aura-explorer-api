const { join } = require('path');

module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : null,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [join(__dirname, './dist/shared/entities/**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, './dist/migrations/**', '*{.ts,.js}')],
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'src/migrations',
  },
  migrationsRun: false,
  synchronize: false,
};
