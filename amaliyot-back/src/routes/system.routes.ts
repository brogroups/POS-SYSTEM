import { Router } from 'express';
import { SystemController } from '../controllers/system.controller';

const router = Router();

router.post('/clear-orders', SystemController.clearOrders);
router.post('/seed', SystemController.seedDemoData);

export default router;
