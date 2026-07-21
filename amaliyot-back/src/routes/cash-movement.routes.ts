import { Router } from 'express';
import { CashMovementController } from '../controllers/cash-movement.controller';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/', CashMovementController.getAll);
router.get('/:id', CashMovementController.getById);
router.post('/', requireRole(['CASHIER', 'MANAGER']), CashMovementController.create);

export default router;
