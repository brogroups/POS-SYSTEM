import { Router } from 'express';
import { DiscountController } from '../controllers/discount.controller';
import { validateDiscount } from '../middleware/discount.validation';

const router = Router();

router.get('/', DiscountController.getAll);
router.get('/:id', DiscountController.getById);
router.post('/', validateDiscount, DiscountController.create);
router.put('/:id', validateDiscount, DiscountController.update);
router.delete('/:id', DiscountController.delete);

export default router;
