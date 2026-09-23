import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { BudgetService } from '../services/budgetService';
import { AIService } from '../services/ai/aiService';

export class ReportsController {
  static async getMonthlyReport(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

      const summary = await BudgetService.getMonthlyBudgetSummary(userId, month);
      const expenses = await BudgetService.getMonthlyExpenses(userId, month);

      res.json({
        summary,
        expenses,
        exportedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate monthly report.' });
    }
  }

  static async exportCsv(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

      const summary = await BudgetService.getMonthlyBudgetSummary(userId, month);
      const expenses = await BudgetService.getMonthlyExpenses(userId, month);

      let csv = `SMARTBUDGET AI - FINANCIAL REPORT (${month})\n\n`;

      csv += `BUDGET VS ACTUAL SUMMARY\n`;
      csv += `Total Budget,Total Spent,Remaining Balance,Utilization Percentage,Status\n`;
      csv += `${summary.totalBudget},${summary.totalSpent},${summary.remaining},${summary.usagePercentage}%,${summary.status}\n\n`;

      csv += `CATEGORY BREAKDOWN\n`;
      csv += `Category,Budget Allocated,Actual Spent,Remaining,Utilization %,Status,Transactions Count\n`;
      for (const cat of summary.categories) {
        csv += `"${cat.categoryName}",${cat.budgetAmount},${cat.spentAmount},${cat.remainingAmount},${cat.usagePercentage}%,${cat.status},${cat.expenseCount}\n`;
      }
      csv += `\n`;

      csv += `EXPENSE TRANSACTIONS\n`;
      csv += `Date,Title,Category,Amount,Description\n`;
      for (const exp of expenses) {
        const dateStr = exp.date.toISOString().split('T')[0];
        const desc = exp.description ? `"${exp.description.replace(/"/g, '""')}"` : '""';
        csv += `${dateStr},"${exp.title.replace(/"/g, '""')}","${exp.category.name}",${exp.amount},${desc}\n`;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="smartbudget-report-${month}.csv"`);
      res.status(200).send(csv);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to export CSV.' });
    }
  }

  static async getAiExplanation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userName = req.user!.name;
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

      const explanation = await AIService.generateMonthlySummary(userId, userName, month);
      res.json({ month, explanation });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate AI explanation.' });
    }
  }
}
