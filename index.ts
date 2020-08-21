import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';
import { createConnection } from 'typeorm';

import router from './routes';
import configs from './configs';

const main = async () => {
  await createConnection({
    type: 'mysql',
    host: configs.database.host,
    port: configs.database.port,
    username: configs.database.username,
    password: configs.database.password,
    database: configs.database.database,
    synchronize: true,
    logging: false,
    entities: ['entity/**/*.ts'],
    migrations: ['migration/**/*.ts'],
  });

  const app = new Koa();

  app.use(logger());
  app.use(bodyparser());

  app.use(router.routes());

  app.listen(configs.server.port);

  console.log(`Listening on http://localhost:${configs.server.port}`);
};

main();
