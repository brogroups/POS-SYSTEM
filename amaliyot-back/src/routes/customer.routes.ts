import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { validateCustomer } from '../middleware/customer.validation';

const router = Router();

router.get('/', CustomerController.getAll);
router.get('/:id', CustomerController.getById);
router.post('/', validateCustomer, CustomerController.create);
router.put('/:id', validateCustomer, CustomerController.update);
router.delete('/:id', CustomerController.delete);

export default router;
