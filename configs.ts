import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export default {
  env: process.env.ENV,
  database: {
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT!, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  server: {
    port: process.env.SERVER_PORT,
    salt: process.env.SERVER_SALT!,
  },
  firewall: {
    pageCount: process.env.FIREWALL_PAGE_COUNT,
  },
};
