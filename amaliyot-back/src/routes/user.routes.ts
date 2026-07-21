import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateUser } from '../middleware/user.validation';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.post('/', requireRole(['MANAGER']), validateUser, UserController.create);
router.put('/:id', requireRole(['MANAGER']), validateUser, UserController.update);
router.delete('/:id', requireRole(['MANAGER']), UserController.delete);

export default router;
