import Router from '@koa/router';
import controller from '../controllers/firewall';

const router = new Router();

router.prefix('/firewall');

router.get('/address', controller.getAllAddress);
router.post('/address', controller.addAddress);
router.delete('/address', controller.delAddress);

router.get('/addressGroup', controller.getAllAddressGroup);
router.get('/addressGroup/detail', controller.getAllAddressGroupDetail);
router.get('/addressGroup/:id', controller.getAddressGroup);
router.put('/addressGroup/:id', controller.updateAddressGroup);

export default router;