import { Router } from 'express';
import { AuditLogController } from '../controllers/audit-log.controller';
import { requireRole } from '../middleware/auth';

const router = Router();

// Audit logs are read-only for Manager+, never deletable
router.get('/', requireRole(['MANAGER']), AuditLogController.getAll);
router.get('/:id', requireRole(['MANAGER']), AuditLogController.getById);

export default router;
