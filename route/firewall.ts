import Router from '@koa/router';
import controller from '../controller/firewall';

const router = new Router();

router.prefix('/firewall');

router.get('/address/:host', controller.firewallHost, controller.getAllAddress);
router.post('/address/:host', controller.firewallHost, controller.addAddress);
router.delete('/address/:host', controller.firewallHost, controller.delAddress);

router.get('/addressGroup/:host', controller.firewallHost, controller.getAllAddressGroup);
router.get('/addressGroup/:host/:id', controller.firewallHost, controller.getAddressGroup);
router.put('/addressGroup/:host/:id', controller.firewallHost, controller.updateAddressGroup);

router.get('/anFlow/:host', controller.firewallHost, controller.getAllAnFlow);
router.del('/anFlow/:host', controller.firewallHost, controller.delAllAnFlow);

export default router;
