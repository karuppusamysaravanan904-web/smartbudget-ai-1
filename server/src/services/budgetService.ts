import prisma from '../config/prisma';

export type BudgetStatus = 'UNDER BUDGET' | 'NEAR LIMIT' | 'OVER BUDGET';

export interface CategoryBudgetDetail {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  budgetId?: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercentage: number;
  status: BudgetStatus;
  overspentAmount: number;
  expenseCount: number;
}

export interface MonthlyBudgetSummary {
  month: string; // YYYY-MM
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  usagePercentage: number;
  status: BudgetStatus;
  categories: CategoryBudgetDetail[];
  overspentCategories: CategoryBudgetDetail[];
  nearLimitCategories: CategoryBudgetDetail[];
  underBudgetCategories: CategoryBudgetDetail[];
}

export class BudgetService {
  /**
   * Helper to parse month into start and end of month Date objects
   */
  static getMonthDateRange(monthStr: string): { start: Date; end: Date } {
    // monthStr format: "YYYY-MM"
    const [year, month] = monthStr.split('-').map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    // Last day of month
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return { start, end };
  }

  /**
   * Get all active categories for a user (system defaults + user created)
   */
  static async getUserCategories(userId: string) {
    return prisma.category.findMany({
      where: {
        OR: [{ isDefault: true }, { userId }],
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Compute full monthly budget summary for a user
   */
  static async getMonthlyBudgetSummary(userId: string, month: string): Promise<MonthlyBudgetSummary> {
    const { start, end } = this.getMonthDateRange(month);

    // 1. Fetch categories
    const categories = await this.getUserCategories(userId);

    // 2. Fetch budgets for this user and month
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month,
      },
    });

    // 3. Fetch expenses for this user within this month range
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // Map budgets by categoryId
    const budgetMap = new Map<string, { id: string; amount: number }>();
    budgets.forEach((b) => {
      budgetMap.set(b.categoryId, { id: b.id, amount: b.amount });
    });

    // Map expenses by categoryId
    const expenseMap = new Map<string, { total: number; count: number }>();
    expenses.forEach((e) => {
      const current = expenseMap.get(e.categoryId) || { total: 0, count: 0 };
      expenseMap.set(e.categoryId, {
        total: current.total + e.amount,
        count: current.count + 1,
      });
    });

    // Calculate category details
    const categoryDetails: CategoryBudgetDetail[] = [];
    let totalBudget = 0;
    let totalSpent = 0;

    for (const cat of categories) {
      const budgetEntry = budgetMap.get(cat.id);
      const expenseEntry = expenseMap.get(cat.id) || { total: 0, count: 0 };

      // If category has neither a budget nor expenses in this month, we still list if budget exists,
      // or if it has expenses. If it has neither, we can still include it with 0 or only list configured ones.
      // To satisfy all requirements, include categories that have a budget OR have expenses.
      const budgetAmount = budgetEntry ? budgetEntry.amount : 0;
      const spentAmount = expenseEntry.total;

      // Only skip if both budget and spent are 0, unless it's explicitly budgeted
      if (budgetAmount === 0 && spentAmount === 0) {
        continue;
      }

      totalBudget += budgetAmount;
      totalSpent += spentAmount;

      const remainingAmount = budgetAmount - spentAmount;
      const usagePercentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : spentAmount > 0 ? 100 : 0;

      let status: BudgetStatus = 'UNDER BUDGET';
      let overspentAmount = 0;

      if (budgetAmount === 0 && spentAmount > 0) {
        status = 'OVER BUDGET';
        overspentAmount = spentAmount;
      } else if (spentAmount > budgetAmount) {
        status = 'OVER BUDGET';
        overspentAmount = spentAmount - budgetAmount;
      } else if (usagePercentage >= 80) {
        status = 'NEAR LIMIT';
      } else {
        status = 'UNDER BUDGET';
      }

      categoryDetails.push({
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        budgetId: budgetEntry?.id,
        budgetAmount,
        spentAmount: Math.round(spentAmount * 100) / 100,
        remainingAmount: Math.round(remainingAmount * 100) / 100,
        usagePercentage: Math.round(usagePercentage * 10) / 10,
        status,
        overspentAmount: Math.round(overspentAmount * 100) / 100,
        expenseCount: expenseEntry.count,
      });
    }

    // Sort categories: Over budget first, then Near limit, then Under budget
    categoryDetails.sort((a, b) => {
      const priority = { 'OVER BUDGET': 3, 'NEAR LIMIT': 2, 'UNDER BUDGET': 1 };
      return priority[b.status] - priority[a.status] || b.spentAmount - a.spentAmount;
    });

    const remaining = totalBudget - totalSpent;
    const overallUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    let overallStatus: BudgetStatus = 'UNDER BUDGET';
    if (totalSpent > totalBudget && totalBudget > 0) {
      overallStatus = 'OVER BUDGET';
    } else if (overallUsage >= 80) {
      overallStatus = 'NEAR LIMIT';
    }

    const overspentCategories = categoryDetails.filter((c) => c.status === 'OVER BUDGET');
    const nearLimitCategories = categoryDetails.filter((c) => c.status === 'NEAR LIMIT');
    const underBudgetCategories = categoryDetails.filter((c) => c.status === 'UNDER BUDGET');

    return {
      month,
      totalBudget: Math.round(totalBudget * 100) / 100,
      totalSpent: Math.round(totalSpent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      usagePercentage: Math.round(overallUsage * 10) / 10,
      status: overallStatus,
      categories: categoryDetails,
      overspentCategories,
      nearLimitCategories,
      underBudgetCategories,
    };
  }

  /**
   * Controlled safe retrieval: Category budget & spending for specific month
   */
  static async getCategoryBudget(userId: string, categoryId: string, month: string) {
    const summary = await this.getMonthlyBudgetSummary(userId, month);
    return summary.categories.find((c) => c.categoryId === categoryId || c.categoryName.toLowerCase() === categoryId.toLowerCase()) || null;
  }

  /**
   * Controlled safe retrieval: Category expenses
   */
  static async getCategoryExpenses(userId: string, categoryId: string, month: string) {
    const { start, end } = this.getMonthDateRange(month);
    return prisma.expense.findMany({
      where: {
        userId,
        categoryId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Controlled safe retrieval: All monthly expenses
   */
  static async getMonthlyExpenses(userId: string, month: string) {
    const { start, end } = this.getMonthDateRange(month);
    return prisma.expense.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });
  }
}
export default BudgetService;
