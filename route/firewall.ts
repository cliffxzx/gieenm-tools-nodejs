import Router from '@koa/router';
import controller from '../controller/firewall';

const router = new Router();

router.prefix('/firewall');

router.get('/address/:host', controller.hostAuth, controller.getAllAddress);
router.post('/address/:host', controller.hostAuth, controller.addAddress);
router.delete('/address/:host', controller.hostAuth, controller.delAddress);

router.get('/addressGroup/:host', controller.hostAuth, controller.getAllAddressGroup);
router.get('/addressGroup/:host/:id', controller.hostAuth, controller.getAddressGroup);
router.put('/addressGroup/:host/:id', controller.hostAuth, controller.updateAddressGroup);

router.get('/anFlow/:host', controller.hostAuth, controller.getAllAnFlow);
router.del('/anFlow/:host', controller.hostAuth, controller.delAllAnFlow);

export default router;
