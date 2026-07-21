import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { validateOrder } from '../middleware/order.validation';
import { requireRole } from '../middleware/auth';

const router = Router();

// Existing CRUD endpoints (backward compatible)
router.get('/', OrderController.getAll);
router.get('/:id', OrderController.getById);
router.post('/', validateOrder, OrderController.create);
router.put('/:id', validateOrder, OrderController.update);
router.delete('/:id', OrderController.delete);

// Service-backed session endpoints
router.post('/sessions/open', requireRole(['WAITER', 'CASHIER', 'MANAGER']), OrderController.openSession);
router.post('/:id/items/edit', requireRole(['WAITER', 'CASHIER', 'MANAGER']), OrderController.editItems);
router.post('/:id/items/move', requireRole(['WAITER', 'CASHIER', 'MANAGER']), OrderController.moveItems);
router.post('/:id/items/swap', requireRole(['WAITER', 'CASHIER', 'MANAGER']), OrderController.swapItem);
router.post('/:id/pay', requireRole(['CASHIER', 'MANAGER']), OrderController.payAndClose);
router.get('/:id/details', OrderController.getSessionDetails);
router.get('/:id/history', OrderController.getItemHistory);
router.post('/transfer-table', requireRole(['WAITER', 'CASHIER', 'MANAGER']), OrderController.transferTableOrder);
router.get('/table/:tableId/sessions', OrderController.getTableSessions);
router.get('/table/:tableId/active-sessions', OrderController.getActiveTableSessions);
router.get('/table/:tableId/timeline', OrderController.getTableTimeline);

export default router;

