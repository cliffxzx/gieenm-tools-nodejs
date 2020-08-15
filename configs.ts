import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export default {
  server: {
    port: process.env.SERVER_PORT,
  },
  firewall: {
    pageCount: process.env.FIREWALL_PAGE_COUNT,
  },
};
