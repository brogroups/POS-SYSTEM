import { Router } from 'express';
import { IngredientController } from '../controllers/ingredient.controller';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/', IngredientController.getAll);
router.get('/:id', IngredientController.getById);
router.post('/', requireRole(['SUPERADMIN', 'MANAGER', 'CASHIER', 'ADMIN']), IngredientController.create);
router.put('/:id', requireRole(['SUPERADMIN', 'MANAGER', 'CASHIER', 'ADMIN']), IngredientController.update);
router.delete('/:id', requireRole(['SUPERADMIN', 'MANAGER', 'CASHIER', 'ADMIN']), IngredientController.delete);

export default router;
