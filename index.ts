import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';
import { createConnection } from 'typeorm';

import router from './route';
import configs from './configs';
import { firewall } from './model/firewall';

const main = async () => {
  await createConnection();

  if (configs.env === 'development') {
    const { Hosts1598113593926 } = await import('./seeder/1598113593926-Hosts');
    const connection = await createConnection('seeder');
    await new Hosts1598113593926().down(connection.createQueryRunner());
    await new Hosts1598113593926().up(connection.createQueryRunner());
    await firewall.syncFirewallToDatabase();
  }

  const app = new Koa();

  app.use(logger());
  app.use(bodyparser());

  app.use(router.routes());

  app.listen(configs.server.port);

  console.log(`Listening on http://localhost:${configs.server.port}`);
};

main();
