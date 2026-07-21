import { Router } from 'express';
import { BranchController } from '../controllers/branch.controller';
import { validateBranch } from '../middleware/branch.validation';

const router = Router();

router.get('/', BranchController.getAll);
router.get('/:id', BranchController.getById);
router.post('/', validateBranch, BranchController.create);
router.put('/:id', validateBranch, BranchController.update);
router.delete('/:id', BranchController.delete);

export default router;
