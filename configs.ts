import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export default {
  database: {
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT!, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  server: {
    port: process.env.SERVER_PORT,
  },
  firewall: {
    pageCount: process.env.FIREWALL_PAGE_COUNT,
  },
};
