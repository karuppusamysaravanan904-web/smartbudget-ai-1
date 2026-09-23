import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/prisma';
import { BudgetService } from '../services/budgetService';

export class ExpenseController {
  static async getExpenses(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { month, categoryId, search, sortBy = 'date', sortOrder = 'desc' } = req.query;

      let whereClause: any = { userId };

      if (month && typeof month === 'string') {
        const { start, end } = BudgetService.getMonthDateRange(month);
        whereClause.date = { gte: start, lte: end };
      }

      if (categoryId && typeof categoryId === 'string' && categoryId !== 'all') {
        whereClause.categoryId = categoryId;
      }

      if (search && typeof search === 'string') {
        whereClause.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
        ];
      }

      const orderByClause: any = {};
      if (sortBy === 'amount') {
        orderByClause.amount = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderByClause.date = sortOrder === 'asc' ? 'asc' : 'desc';
      }

      const expenses = await prisma.expense.findMany({
        where: whereClause,
        include: { category: true },
        orderBy: orderByClause,
      });

      res.json(expenses);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve expenses.' });
    }
  }

  static async createExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { title, amount, categoryId, date, description } = req.body;

      if (!title || amount === undefined || !categoryId || !date) {
        return res.status(400).json({ error: 'Title, amount, categoryId, and date are required.' });
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Expense amount must be greater than zero.' });
      }

      const expenseDate = new Date(date);
      if (isNaN(expenseDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format.' });
      }

      const expense = await prisma.expense.create({
        data: {
          userId,
          title: title.trim(),
          amount: numAmount,
          categoryId,
          date: expenseDate,
          description: description?.trim() || null,
        },
        include: { category: true },
      });

      // Calculate the month string for the expense to update summary
      const monthStr = expenseDate.toISOString().slice(0, 7);
      const updatedSummary = await BudgetService.getMonthlyBudgetSummary(userId, monthStr);

      res.status(201).json({ expense, summary: updatedSummary });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create expense.' });
    }
  }

  static async updateExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { title, amount, categoryId, date, description } = req.body;

      const existing = await prisma.expense.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Expense not found or unauthorized.' });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title.trim();
      if (amount !== undefined) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          return res.status(400).json({ error: 'Amount must be greater than zero.' });
        }
        updateData.amount = numAmount;
      }
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (date !== undefined) {
        const d = new Date(date);
        if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid date.' });
        updateData.date = d;
      }
      if (description !== undefined) updateData.description = description?.trim() || null;

      const updated = await prisma.expense.update({
        where: { id },
        data: updateData,
        include: { category: true },
      });

      const monthStr = (updateData.date || existing.date).toISOString().slice(0, 7);
      const updatedSummary = await BudgetService.getMonthlyBudgetSummary(userId, monthStr);

      res.json({ expense: updated, summary: updatedSummary });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update expense.' });
    }
  }

  static async deleteExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const existing = await prisma.expense.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Expense not found or unauthorized.' });
      }

      const monthStr = existing.date.toISOString().slice(0, 7);
      await prisma.expense.delete({ where: { id } });

      const updatedSummary = await BudgetService.getMonthlyBudgetSummary(userId, monthStr);
      res.json({ message: 'Expense deleted successfully.', summary: updatedSummary });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete expense.' });
    }
  }
}
