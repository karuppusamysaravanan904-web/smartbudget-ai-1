import { Router } from 'express';
import { ReportsController } from '../controllers/reportsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/monthly', ReportsController.getMonthlyReport);
router.get('/export-csv', ReportsController.exportCsv);
router.get('/ai-explanation', ReportsController.getAiExplanation);

export default router;
