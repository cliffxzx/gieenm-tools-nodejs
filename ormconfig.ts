import configs from './configs';

const baseConfig = {
  type: 'mysql',
  host: configs.database.host,
  port: configs.database.port,
  username: configs.database.username,
  password: configs.database.password,
  database: configs.database.database,
  entities: ['entity/**/*.ts'],
};

export =[{
  ...baseConfig,
  synchronize: true,
  logging: false,
  migrations: ['migration/**/*.ts'],
  cli: {
    migrationsDir: 'migration/',
  },
}, {
  ...baseConfig,
  name: 'seeder',
  synchronize: true,
  logging: false,
  migrations: ['seeder/**/*.ts'],
  cli: {
    migrationsDir: 'seeder',
  },
}];
