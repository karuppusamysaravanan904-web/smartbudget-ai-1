import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/summary', BudgetController.getSummary);
router.post('/', BudgetController.upsertBudget);
router.delete('/:id', BudgetController.deleteBudget);
router.post('/copy-month', BudgetController.copyFromMonth);

export default router;
