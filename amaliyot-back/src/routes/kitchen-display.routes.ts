import { Router } from 'express';
import { KitchenDisplayController } from '../controllers/kitchen-display.controller';
import { validateKitchenDisplay } from '../middleware/kitchen-display.validation';

const router = Router();

router.get('/', KitchenDisplayController.getAll);
router.get('/:id', KitchenDisplayController.getById);
router.post('/', validateKitchenDisplay, KitchenDisplayController.create);
router.put('/:id', validateKitchenDisplay, KitchenDisplayController.update);
router.delete('/:id', KitchenDisplayController.delete);

export default router;
