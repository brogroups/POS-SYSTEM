import { Router } from 'express';
import { PurchaseController } from '../controllers/purchase.controller';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/', PurchaseController.getAll);
router.get('/:id', PurchaseController.getById);
router.post('/', requireRole(['MANAGER']), PurchaseController.create);
router.post('/:id/pay', requireRole(['MANAGER']), PurchaseController.markAsPaid);

export default router;
