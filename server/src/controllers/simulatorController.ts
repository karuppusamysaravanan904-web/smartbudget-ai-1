import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { SimulatorService } from '../services/simulatorService';

export class SimulatorController {
  static async simulate(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { categoryId, categoryName, amount, month, type = 'expense' } = req.body;

      if (amount === undefined || amount === null) {
        return res.status(400).json({ error: 'Hypothetical amount is required.' });
      }

      const activeMonth = month || new Date().toISOString().slice(0, 7);

      const result = await SimulatorService.simulate(userId, {
        categoryId,
        categoryName,
        amount: parseFloat(amount),
        month: activeMonth,
        type,
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Simulation calculation failed.' });
    }
  }
}
