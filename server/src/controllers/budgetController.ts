import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/prisma';
import { BudgetService } from '../services/budgetService';

export class BudgetController {
  static async getSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

      const summary = await BudgetService.getMonthlyBudgetSummary(userId, month);
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve monthly budget summary.' });
    }
  }

  static async upsertBudget(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { categoryId, month, amount } = req.body;

      if (!categoryId || !month || amount === undefined || amount === null) {
        return res.status(400).json({ error: 'categoryId, month, and amount are required.' });
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 0) {
        return res.status(400).json({ error: 'Budget amount must be a positive number.' });
      }

      // Upsert to strictly prevent duplicate entries for User + Month + Category
      const budget = await prisma.budget.upsert({
        where: {
          userId_categoryId_month: {
            userId,
            categoryId,
            month,
          },
        },
        update: {
          amount: numAmount,
        },
        create: {
          userId,
          categoryId,
          month,
          amount: numAmount,
        },
        include: {
          category: true,
        },
      });

      // Return updated summary immediately for seamless UI update
      const updatedSummary = await BudgetService.getMonthlyBudgetSummary(userId, month);
      res.json({ budget, summary: updatedSummary });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save budget.' });
    }
  }

  static async deleteBudget(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const budget = await prisma.budget.findFirst({
        where: { id, userId },
      });

      if (!budget) {
        return res.status(404).json({ error: 'Budget not found or unauthorized.' });
      }

      await prisma.budget.delete({ where: { id } });

      const updatedSummary = await BudgetService.getMonthlyBudgetSummary(userId, budget.month);
      res.json({ message: 'Budget deleted successfully.', summary: updatedSummary });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete budget.' });
    }
  }

  static async copyFromMonth(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sourceMonth, targetMonth } = req.body;

      if (!sourceMonth || !targetMonth) {
        return res.status(400).json({ error: 'sourceMonth and targetMonth are required.' });
      }

      const sourceBudgets = await prisma.budget.findMany({
        where: { userId, month: sourceMonth },
      });

      if (sourceBudgets.length === 0) {
        return res.status(404).json({ error: `No budgets found in ${sourceMonth} to copy.` });
      }

      for (const b of sourceBudgets) {
        await prisma.budget.upsert({
          where: {
            userId_categoryId_month: {
              userId,
              categoryId: b.categoryId,
              month: targetMonth,
            },
          },
          update: { amount: b.amount },
          create: {
            userId,
            categoryId: b.categoryId,
            month: targetMonth,
            amount: b.amount,
          },
        });
      }

      const summary = await BudgetService.getMonthlyBudgetSummary(userId, targetMonth);
      res.json({ message: `Copied ${sourceBudgets.length} budgets to ${targetMonth}.`, summary });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
