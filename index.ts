import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';

import router from './routes';

import configs from './configs';

const app = new Koa();

app.use(logger());
app.use(bodyparser());

app.use(router.routes());

app.listen(configs.server.port);

console.log(`Listening on http://localhost:${configs.server.port}`);