import Router from '@koa/router';

import firewall from './firewall';

const router = new Router();

router.use(firewall.routes());

export default router;