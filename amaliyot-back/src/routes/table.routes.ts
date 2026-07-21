import { Router } from 'express';
import { RestaurantTableController } from '../controllers/table.controller';
import { validateRestaurantTable } from '../middleware/table.validation';
import { requireRole } from '../middleware/auth';

const router = Router();

// Existing CRUD endpoints (backward compatible)
router.get('/', RestaurantTableController.getAll);
router.get('/:id', RestaurantTableController.getById);
router.post('/', validateRestaurantTable, RestaurantTableController.create);
router.put('/:id', validateRestaurantTable, RestaurantTableController.update);
router.delete('/:id', RestaurantTableController.delete);

// Service-backed table management endpoints
router.post('/:id/freeze', requireRole(['WAITER', 'CASHIER', 'MANAGER']), RestaurantTableController.freezeTable);
router.post('/:id/unfreeze', requireRole(['WAITER', 'CASHIER', 'MANAGER']), RestaurantTableController.unfreezeTable);
router.post('/:id/close', requireRole(['CASHIER', 'MANAGER']), RestaurantTableController.closeTable);
router.get('/:id/timeline', RestaurantTableController.getTimeline);

export default router;
