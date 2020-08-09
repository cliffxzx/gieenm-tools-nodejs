import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

export default {
  server: {
    port: process.env.SERVER_PORT,
  }
}