import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validateProduct } from '../middleware/product.validation';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', validateProduct, ProductController.create);
router.put('/:id', validateProduct, ProductController.update);
router.delete('/:id', ProductController.delete);

export default router;
