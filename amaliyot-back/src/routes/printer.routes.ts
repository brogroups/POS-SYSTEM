import { Router } from 'express';
import { PrinterController } from '../controllers/printer.controller';
import { validatePrinter } from '../middleware/printer.validation';

const router = Router();

router.get('/', PrinterController.getAll);
router.get('/scan', PrinterController.scanLan);
router.post('/test-lan', PrinterController.testLanPrinter);
router.get('/:id', PrinterController.getById);
router.post('/', validatePrinter, PrinterController.create);
router.put('/:id', validatePrinter, PrinterController.update);
router.delete('/:id', PrinterController.delete);

export default router;

