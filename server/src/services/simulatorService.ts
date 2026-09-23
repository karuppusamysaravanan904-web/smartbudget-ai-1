import { BudgetService } from './budgetService';

export interface SimulationRequest {
  categoryId?: string;
  categoryName?: string;
  amount: number;
  month: string;
  type?: 'expense' | 'budget_change';
}

export interface SimulationResult {
  isSimulation: true;
  categoryName: string;
  currentBudget: number;
  currentSpending: number;
  currentRemaining: number;
  hypotheticalAmount: number;
  type: 'expense' | 'budget_change';
  projectedSpending: number;
  projectedBudget: number;
  projectedRemaining: number;
  projectedUsagePercentage: number;
  previousStatus: 'UNDER BUDGET' | 'NEAR LIMIT' | 'OVER BUDGET';
  projectedStatus: 'UNDER BUDGET' | 'NEAR LIMIT' | 'OVER BUDGET';
  outcomeMessage: string;
  isOverBudget: boolean;
  varianceAmount: number; // Positive if savings, negative if overspending
  totalMonthlyImpact: {
    currentTotalBudget: number;
    currentTotalSpent: number;
    currentTotalRemaining: number;
    projectedTotalSpent: number;
    projectedTotalRemaining: number;
  };
  financialProfileImpact?: {
    hasProfile: boolean;
    monthlyIncome: number;
    totalFixedExpenses: number;
    monthlySavingsGoal: number;
    currentAvailableSpending: number;
    projectedAvailableSpending: number;
    message: string;
  };
}

export class SimulatorService {
  /**
   * Run what-if hypothetical calculation WITHOUT persisting any data
   */
  static async simulate(userId: string, req: SimulationRequest): Promise<SimulationResult> {
    const summary = await BudgetService.getMonthlyBudgetSummary(userId, req.month);

    // Find category either by categoryId or matching name
    let targetCategory = summary.categories.find(
      (c) =>
        (req.categoryId && c.categoryId === req.categoryId) ||
        (req.categoryName && c.categoryName.toLowerCase() === req.categoryName.toLowerCase())
    );

    if (!targetCategory && req.categoryName) {
      // Look through all user categories in case this category had 0 budget and 0 expenses
      const allCategories = await BudgetService.getUserCategories(userId);
      const found = allCategories.find((c) => c.name.toLowerCase() === req.categoryName?.toLowerCase());
      if (found) {
        targetCategory = {
          categoryId: found.id,
          categoryName: found.name,
          categoryIcon: found.icon,
          categoryColor: found.color,
          budgetAmount: 0,
          spentAmount: 0,
          remainingAmount: 0,
          usagePercentage: 0,
          status: 'UNDER BUDGET',
          overspentAmount: 0,
          expenseCount: 0,
        };
      }
    }

    const categoryName = targetCategory ? targetCategory.categoryName : req.categoryName || 'General Spending';
    const currentBudget = targetCategory ? targetCategory.budgetAmount : 0;
    const currentSpending = targetCategory ? targetCategory.spentAmount : 0;
    const currentRemaining = currentBudget - currentSpending;
    const previousStatus = targetCategory ? targetCategory.status : 'UNDER BUDGET';

    const simType = req.type || 'expense';
    let projectedBudget = currentBudget;
    let projectedSpending = currentSpending;

    if (simType === 'expense') {
      projectedSpending += req.amount;
    } else {
      // budget change
      projectedBudget = req.amount;
    }

    const projectedRemaining = projectedBudget - projectedSpending;
    const projectedUsage = projectedBudget > 0 ? (projectedSpending / projectedBudget) * 100 : projectedSpending > 0 ? 100 : 0;

    let projectedStatus: 'UNDER BUDGET' | 'NEAR LIMIT' | 'OVER BUDGET' = 'UNDER BUDGET';
    if (projectedSpending > projectedBudget) {
      projectedStatus = 'OVER BUDGET';
    } else if (projectedUsage >= 80) {
      projectedStatus = 'NEAR LIMIT';
    }

    const isOverBudget = projectedSpending > projectedBudget;
    const overspentBy = Math.max(0, projectedSpending - projectedBudget);

    let outcomeMessage = '';
    if (isOverBudget) {
      outcomeMessage = `Your ${categoryName} budget would exceed the allocated limit by ₹${overspentBy.toLocaleString('en-IN')}.`;
    } else if (projectedStatus === 'NEAR LIMIT') {
      outcomeMessage = `You would remain within budget, but ${categoryName} would enter the warning zone at ${Math.round(projectedUsage)}% utilization with ₹${projectedRemaining.toLocaleString('en-IN')} remaining.`;
    } else {
      outcomeMessage = `You can safely afford this expense. ₹${projectedRemaining.toLocaleString('en-IN')} would remain in your ${categoryName} budget.`;
    }

    const currentTotalBudget = summary.totalBudget;
    const currentTotalSpent = summary.totalSpent;
    const currentTotalRemaining = summary.remaining;
    const projectedTotalSpent = simType === 'expense' ? currentTotalSpent + req.amount : currentTotalSpent;
    const projectedTotalRemaining = currentTotalBudget - projectedTotalSpent;

    // Check Financial Profile Impact
    let financialProfileImpact: SimulationResult['financialProfileImpact'] = undefined;
    try {
      const { FinancialProfileService } = await import('./financialProfileService');
      const { profile, metrics, hasProfile } = await FinancialProfileService.getComputedProfile(userId, req.month);
      if (hasProfile && metrics) {
        const currentAvail = metrics.availableSpending;
        const projectedAvail = simType === 'expense' ? Math.max(0, currentAvail - req.amount) : currentAvail;
        const impactDiff = currentAvail - projectedAvail;

        financialProfileImpact = {
          hasProfile: true,
          monthlyIncome: metrics.monthlyIncome,
          totalFixedExpenses: metrics.totalFixedExpenses,
          monthlySavingsGoal: metrics.monthlySavingsGoal,
          currentAvailableSpending: currentAvail,
          projectedAvailableSpending: projectedAvail,
          message: simType === 'expense'
            ? `Your available variable spending would reduce from ₹${currentAvail.toLocaleString('en-IN')} to ₹${projectedAvail.toLocaleString('en-IN')}.`
            : `Your available variable spending remains ₹${currentAvail.toLocaleString('en-IN')}.`,
        };
      }
    } catch (err) {
      console.warn('Failed to calculate financial profile impact for simulation:', err);
    }

    return {
      isSimulation: true,
      categoryName,
      currentBudget,
      currentSpending,
      currentRemaining,
      hypotheticalAmount: req.amount,
      type: simType,
      projectedSpending,
      projectedBudget,
      projectedRemaining,
      projectedUsagePercentage: Math.round(projectedUsage * 10) / 10,
      previousStatus,
      projectedStatus,
      outcomeMessage,
      isOverBudget,
      varianceAmount: projectedRemaining,
      totalMonthlyImpact: {
        currentTotalBudget,
        currentTotalSpent,
        currentTotalRemaining,
        projectedTotalSpent,
        projectedTotalRemaining,
      },
      financialProfileImpact,
    };
  }
}
export default SimulatorService;
