import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/query', AIController.query);
router.get('/insights', AIController.getInsights);
router.get('/health', AIController.getHealthScore);
router.get('/recommendations', AIController.getRecommendations);
router.get('/history', AIController.getHistory);
router.delete('/clear', AIController.clearHistory);

export default router;
