import { Router } from 'express';
import { ShiftSessionController } from '../controllers/shift-session.controller';
import { validateShiftSession } from '../middleware/shift-session.validation';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/', ShiftSessionController.getAll);
router.get('/:id', ShiftSessionController.getById);
router.post('/', requireRole(['CASHIER', 'MANAGER']), validateShiftSession, ShiftSessionController.create);
router.put('/:id', requireRole(['CASHIER', 'MANAGER']), validateShiftSession, ShiftSessionController.update);
router.delete('/:id', requireRole(['MANAGER']), ShiftSessionController.delete);
router.get('/:id/validate', requireRole(['CASHIER', 'MANAGER']), ShiftSessionController.validateClose);
router.post('/:id/close', requireRole(['CASHIER', 'MANAGER']), ShiftSessionController.closeShift);
router.get('/:id/report', requireRole(['CASHIER', 'MANAGER']), ShiftSessionController.generateReport);
router.get('/:id/cash-summary', requireRole(['CASHIER', 'MANAGER']), ShiftSessionController.getCashSummary);
router.get('/:id/cash-movements', requireRole(['CASHIER', 'MANAGER']), ShiftSessionController.getCashMovements);

export default router;

