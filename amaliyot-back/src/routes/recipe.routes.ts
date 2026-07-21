import { Router } from 'express';
import { RecipeController } from '../controllers/recipe.controller';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/', RecipeController.getAll);
router.get('/:id', RecipeController.getById);
router.get('/product/:productId', RecipeController.getByProductId);
router.post('/', requireRole(['SUPERADMIN', 'MANAGER', 'CASHIER', 'ADMIN']), RecipeController.create);
router.put('/:id', requireRole(['SUPERADMIN', 'MANAGER', 'CASHIER', 'ADMIN']), RecipeController.update);
router.delete('/:id', requireRole(['SUPERADMIN', 'MANAGER', 'CASHIER', 'ADMIN']), RecipeController.delete);

export default router;
