import { Router } from 'express';
import { StockMovementController } from '../controllers/stock-movement.controller';
import { validateStockMovement } from '../middleware/stock-movement.validation';

const router = Router();

router.get('/', StockMovementController.getAll);
router.get('/:id', StockMovementController.getById);
router.post('/', validateStockMovement, StockMovementController.create);
router.put('/:id', validateStockMovement, StockMovementController.update);
router.delete('/:id', StockMovementController.delete);

export default router;
