import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { validatePayment } from '../middleware/payment.validation';

const router = Router();

router.get('/', PaymentController.getAll);
router.get('/:id', PaymentController.getById);
router.post('/', validatePayment, PaymentController.create);
router.put('/:id', validatePayment, PaymentController.update);
router.delete('/:id', PaymentController.delete);

export default router;
