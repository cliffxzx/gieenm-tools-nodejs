import Router from '@koa/router';
import controller from '../controllers/firewall';

const router = new Router();

router.prefix('/firewall');

router.get('/address/:flr', controller.floorAuth, controller.getAllAddress);
router.post('/address/:flr', controller.floorAuth, controller.addAddress);
router.delete('/address/:flr', controller.floorAuth, controller.delAddress);

router.get('/addressGroup/:flr', controller.floorAuth, controller.getAllAddressGroup);
router.get('/addressGroup/:flr/:id', controller.floorAuth, controller.getAddressGroup);
router.put('/addressGroup/:flr/:id', controller.floorAuth, controller.updateAddressGroup);

router.get('/anFlow/:flr', controller.floorAuth, controller.getAllAnFlow);
router.del('/anFlow/:flr', controller.floorAuth, controller.delAllAnFlow);

export default router;
