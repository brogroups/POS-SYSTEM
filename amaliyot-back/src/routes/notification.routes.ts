import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { validateNotification } from '../middleware/notification.validation';

const router = Router();

router.get('/', NotificationController.getAll);
router.get('/:id', NotificationController.getById);
router.post('/', validateNotification, NotificationController.create);
router.put('/:id', validateNotification, NotificationController.update);
router.delete('/:id', NotificationController.delete);

export default router;
