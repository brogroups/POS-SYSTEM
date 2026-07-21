import { Router } from 'express';
import { HookahController } from '../controllers/hookah.controller';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/', HookahController.getAll);
router.get('/reports/daily', HookahController.getDailyReport);
router.get('/:id', HookahController.getById);
router.post('/', requireRole(['MANAGER']), HookahController.create);
router.put('/:id', requireRole(['MANAGER']), HookahController.update);
router.delete('/:id', requireRole(['MANAGER']), HookahController.delete);
router.post('/:id/link-product', requireRole(['MANAGER']), HookahController.linkToProduct);

export default router;
