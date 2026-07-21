import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { validateExpense } from '../middleware/expense.validation';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/', ExpenseController.getAll);
router.get('/:id', ExpenseController.getById);
router.post('/', requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER', 'CASHIER', 'WAITER']), validateExpense, ExpenseController.create);
router.put('/:id', requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER', 'CASHIER']), validateExpense, ExpenseController.update);
router.delete('/:id', requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), ExpenseController.delete);
router.post('/:id/approve', requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER', 'CASHIER']), ExpenseController.approve);
router.post('/:id/reject', requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER', 'CASHIER']), ExpenseController.reject);

export default router;
