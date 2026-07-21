import { Router } from 'express';
import { OrderItemController } from '../controllers/order-item.controller';
import { validateOrderItem } from '../middleware/order-item.validation';

const router = Router();

router.get('/', OrderItemController.getAll);
router.get('/:id', OrderItemController.getById);
router.post('/', validateOrderItem, OrderItemController.create);
router.put('/:id', validateOrderItem, OrderItemController.update);
router.delete('/:id', OrderItemController.delete);

export default router;
