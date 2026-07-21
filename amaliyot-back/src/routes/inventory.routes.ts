import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { validateInventory } from '../middleware/inventory.validation';

const router = Router();

router.get('/', InventoryController.getAll);
router.get('/:id', InventoryController.getById);
router.post('/', validateInventory, InventoryController.create);
router.put('/:id', validateInventory, InventoryController.update);
router.delete('/:id', InventoryController.delete);

export default router;
