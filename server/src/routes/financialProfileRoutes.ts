import { Router } from 'express';
import { FinancialProfileController } from '../controllers/financialProfileController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/financial', FinancialProfileController.getProfile);
router.post('/financial', FinancialProfileController.saveProfile);
router.put('/financial', FinancialProfileController.saveProfile);
router.delete('/financial', FinancialProfileController.deleteProfile);
router.get('/financial/suggested-budget', FinancialProfileController.getSuggestedBudget);

export default router;
