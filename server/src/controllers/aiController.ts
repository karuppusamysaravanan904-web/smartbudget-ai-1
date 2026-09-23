import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AIService } from '../services/ai/aiService';
import { BudgetService } from '../services/budgetService';
import { InsightsService } from '../services/insightsService';
import { HealthScoreService } from '../services/healthScoreService';

export class AIController {
  static async query(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userName = req.user!.name;
      const { question, month, conversationId } = req.body;

      if (!question || !question.trim()) {
        return res.status(400).json({ error: 'Question is required.' });
      }

      const activeMonth = month || new Date().toISOString().slice(0, 7);

      const result = await AIService.query(
        userId,
        userName,
        activeMonth,
        question.trim(),
        conversationId
      );

      res.json(result);
    } catch (err: any) {
      console.error('[AIController Error]:', err);
      res.status(500).json({
        answer: 'BudgetAI is temporarily unavailable. You can still view your budget and expenses.',
        provider: 'Fallback',
        isSimulation: false,
      });
    }
  }

  static async getInsights(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

      const summary = await BudgetService.getMonthlyBudgetSummary(userId, month);
      const insights = InsightsService.generateInsights(summary);

      res.json({ month, insights });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate insights.' });
    }
  }

  static async getHealthScore(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

      const summary = await BudgetService.getMonthlyBudgetSummary(userId, month);
      const health = HealthScoreService.calculateHealthScore(summary);

      res.json({ month, health });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to calculate health score.' });
    }
  }

  static async getRecommendations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

      const summary = await BudgetService.getMonthlyBudgetSummary(userId, month);

      // Analyze spending vs budget to recommend adjustments (Requirement 13)
      const suggestions: {
        id: string;
        categoryId: string;
        categoryName: string;
        currentBudget: number;
        suggestedBudget: number;
        reason: string;
        confidence: string;
      }[] = [];

      for (const cat of summary.categories) {
        if (cat.status === 'OVER BUDGET') {
          // Suggest adjusting budget to cover spending plus 10% safety cushion
          const recommended = Math.ceil((cat.spentAmount * 1.1) / 500) * 500;
          suggestions.push({
            id: `rec-adjust-${cat.categoryId}`,
            categoryId: cat.categoryId,
            categoryName: cat.categoryName,
            currentBudget: cat.budgetAmount,
            suggestedBudget: recommended,
            reason: `Your recent ${cat.categoryName} spending (₹${cat.spentAmount.toLocaleString('en-IN')}) exceeded your current budget. Consider aligning your budget to realistic spending trends.`,
            confidence: 'High',
          });
        } else if (cat.status === 'UNDER BUDGET' && cat.budgetAmount > 2000 && cat.usagePercentage < 40) {
          // Suggest reallocating idle surplus
          const optimized = Math.max(1000, Math.ceil((cat.spentAmount * 1.3) / 500) * 500);
          if (optimized < cat.budgetAmount) {
            suggestions.push({
              id: `rec-optimize-${cat.categoryId}`,
              categoryId: cat.categoryId,
              categoryName: cat.categoryName,
              currentBudget: cat.budgetAmount,
              suggestedBudget: optimized,
              reason: `You consistently use less than 40% of ${cat.categoryName}. You could safely free up ₹${(cat.budgetAmount - optimized).toLocaleString('en-IN')} for emergency savings or debt payoff.`,
              confidence: 'Medium',
            });
          }
        }
      }

      res.json({ month, suggestions });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate recommendations.' });
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const history = await AIService.getHistory(userId);
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async clearHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      await AIService.clearHistory(userId);
      res.json({ message: 'Conversation history cleared successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
