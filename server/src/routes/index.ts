import { Router } from 'express';
import authRoutes from './authRoutes';
import budgetRoutes from './budgetRoutes';
import expenseRoutes from './expenseRoutes';
import categoryRoutes from './categoryRoutes';
import simulatorRoutes from './simulatorRoutes';
import reportsRoutes from './reportsRoutes';
import aiRoutes from './aiRoutes';
import financialProfileRoutes from './financialProfileRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/budgets', budgetRoutes);
apiRouter.use('/expenses', expenseRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/simulator', simulatorRoutes);
apiRouter.use('/reports', reportsRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/profile', financialProfileRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    name: 'SmartBudget AI API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
