import { Router } from 'express';
import { SimulatorController } from '../controllers/simulatorController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', SimulatorController.simulate);

export default router;
