import { BudgetService, MonthlyBudgetSummary } from './budgetService';
import { SimulatorService, SimulationResult } from './simulatorService';
import { FinancialProfileService, CalculatedFinancialMetrics } from './financialProfileService';

export interface ExtractedIntent {
  type:
    | 'general_inquiry'
    | 'overspending'
    | 'category_query'
    | 'affordability'
    | 'simulation'
    | 'summary'
    | 'recommendation'
    | 'fixed_expenses'
    | 'available_spending'
    | 'household_query'
    | 'savings_query';
  categoryName?: string;
  amount?: number;
}

export interface UserFinancialContext {
  userId: string;
  userName: string;
  month: string;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  usagePercentage: number;
  status: string;
  categories: {
    name: string;
    budget: number;
    spent: number;
    remaining: number;
    usagePercentage: number;
    status: string;
    overspentAmount: number;
  }[];
  overspentCategories: string[];
  nearLimitCategories: string[];
  topExpenses: {
    title: string;
    amount: number;
    category: string;
    date: string;
  }[];
  simulation?: SimulationResult;
  financialProfile?: CalculatedFinancialMetrics;
}

export class ContextBuilder {
  /**
   * Simple and effective intent detector for questions
   */
  static detectIntent(question: string): ExtractedIntent {
    const q = question.toLowerCase();

    // Check for simulation patterns: "what happens if", "what if", "suppose i spend", "can i afford"
    const amountMatch = q.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/);
    let amount: number | undefined = undefined;
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Category detection words
    const commonCategories = [
      'food',
      'travel',
      'education',
      'housing',
      'utilities',
      'healthcare',
      'entertainment',
      'shopping',
      'transportation',
      'dinner',
      'groceries',
    ];

    let matchedCategory: string | undefined = undefined;
    for (const cat of commonCategories) {
      if (q.includes(cat)) {
        if (cat === 'dinner' || cat === 'groceries') {
          matchedCategory = 'Food';
        } else {
          matchedCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
        }
        break;
      }
    }

    if (q.includes('what if') || q.includes('what happens if') || q.includes('suppose') || q.includes('simulate')) {
      return { type: 'simulation', categoryName: matchedCategory, amount };
    }

    if (q.includes('fixed') || q.includes('rent') || q.includes('emi') || q.includes('percentage of my income')) {
      return { type: 'fixed_expenses', amount };
    }

    if (q.includes('available') || q.includes('variable spending') || q.includes('how much of my income')) {
      return { type: 'available_spending', amount };
    }

    if (q.includes('household') || q.includes('earning member') || q.includes('dependents') || q.includes('family')) {
      return { type: 'household_query' };
    }

    if (q.includes('savings goal') || q.includes('increase my savings') || q.includes('save')) {
      return { type: 'savings_query', amount };
    }

    if (q.includes('can i afford') || q.includes('can i spend')) {
      return { type: 'affordability', categoryName: matchedCategory, amount };
    }

    if (q.includes('overspend') || q.includes('over budget') || q.includes('exceeded') || q.includes('where am i')) {
      return { type: 'overspending', categoryName: matchedCategory };
    }

    if (q.includes('summary') || q.includes('overview') || q.includes('explain my spending')) {
      return { type: 'summary' };
    }

    if (q.includes('recommend') || q.includes('suggest') || q.includes('suggest a budget') || q.includes('which category should i reduce')) {
      return { type: 'recommendation' };
    }

    if (matchedCategory) {
      return { type: 'category_query', categoryName: matchedCategory, amount };
    }

    return { type: 'general_inquiry', amount };
  }

  /**
   * Build complete scoped financial snapshot for the authenticated user
   */
  static async buildUserFinancialContext(
    userId: string,
    userName: string,
    month: string,
    question?: string
  ): Promise<UserFinancialContext> {
    const summary = await BudgetService.getMonthlyBudgetSummary(userId, month);
    const recentExpenses = await BudgetService.getMonthlyExpenses(userId, month);
    const { metrics, hasProfile } = await FinancialProfileService.getComputedProfile(userId, month);

    let simulationResult: SimulationResult | undefined = undefined;

    if (question) {
      const intent = this.detectIntent(question);
      if ((intent.type === 'simulation' || intent.type === 'affordability') && intent.amount) {
        simulationResult = await SimulatorService.simulate(userId, {
          month,
          categoryName: intent.categoryName || 'General',
          amount: intent.amount,
          type: 'expense',
        });
      }
    }

    const categories = summary.categories.map((c) => ({
      name: c.categoryName,
      budget: c.budgetAmount,
      spent: c.spentAmount,
      remaining: c.remainingAmount,
      usagePercentage: c.usagePercentage,
      status: c.status,
      overspentAmount: c.overspentAmount,
    }));

    const topExpenses = recentExpenses.slice(0, 8).map((e) => ({
      title: e.title,
      amount: e.amount,
      category: e.category.name,
      date: e.date.toISOString().split('T')[0],
    }));

    return {
      userId,
      userName,
      month,
      totalBudget: summary.totalBudget,
      totalSpent: summary.totalSpent,
      remaining: summary.remaining,
      usagePercentage: summary.usagePercentage,
      status: summary.status,
      categories,
      overspentCategories: summary.overspentCategories.map((c) => `${c.categoryName} (exceeded by ₹${c.overspentAmount})`),
      nearLimitCategories: summary.nearLimitCategories.map((c) => `${c.categoryName} (${c.usagePercentage}% used, ₹${c.remainingAmount} left)`),
      topExpenses,
      simulation: simulationResult,
      financialProfile: hasProfile && metrics ? metrics : undefined,
    };
  }

  /**
   * Format context into LLM prompt text
   */
  static buildPrompt(context: UserFinancialContext, userQuestion: string): string {
    const profileText = context.financialProfile
      ? `
HOUSEHOLD & FINANCIAL PROFILE CONTEXT:
Monthly Household Income: ₹${context.financialProfile.monthlyIncome.toLocaleString('en-IN')}
Income Frequency: ${context.financialProfile.incomeFrequency}
Household Size: ${context.financialProfile.householdMembers} members (${context.financialProfile.earningMembers} earning, ${context.financialProfile.dependents} dependents: ${context.financialProfile.children} children, ${context.financialProfile.adults} adults, ${context.financialProfile.seniors} seniors)
Total Fixed Expenses: ₹${context.financialProfile.totalFixedExpenses.toLocaleString('en-IN')} (${context.financialProfile.fixedExpenseRatio}% of income)
  - Rent: ₹${context.financialProfile.monthlyRent.toLocaleString('en-IN')}
  - EMI: ₹${context.financialProfile.monthlyEmi.toLocaleString('en-IN')}
  - Utilities: ₹${context.financialProfile.monthlyUtilities.toLocaleString('en-IN')}
  - Insurance: ₹${context.financialProfile.monthlyInsurance.toLocaleString('en-IN')}
  - Other: ₹${context.financialProfile.otherFixedExpenses.toLocaleString('en-IN')}
Monthly Savings Goal: ₹${context.financialProfile.monthlySavingsGoal.toLocaleString('en-IN')} (${context.financialProfile.savingsRatio}% of income)
Available for Variable Spending: ₹${context.financialProfile.availableSpending.toLocaleString('en-IN')} (${context.financialProfile.variableSpendingRatio}% of income)
Planned Category Budgets Total: ₹${context.financialProfile.totalCategoryBudgets.toLocaleString('en-IN')}
Category Budgets Assessment: ${context.financialProfile.budgetFitMessage}
`
      : 'HOUSEHOLD FINANCIAL PROFILE: Not yet configured by user.';

    return `
CURRENT USER FINANCIAL CONTEXT (Authenticated User: ${context.userName}):
Month: ${context.month}
${profileText}

VARIABLE SPENDING & BUDGET PERFORMANCE:
Total Monthly Planned Budget: ₹${context.totalBudget.toLocaleString('en-IN')}
Total Amount Spent: ₹${context.totalSpent.toLocaleString('en-IN')}
Remaining Total Balance: ₹${context.remaining.toLocaleString('en-IN')}
Overall Budget Utilization: ${context.usagePercentage}%
Overall Status: ${context.status}

CATEGORY BREAKDOWN:
${context.categories
  .map(
    (c) =>
      `- ${c.name}: Budget ₹${c.budget.toLocaleString('en-IN')} | Spent ₹${c.spent.toLocaleString('en-IN')} | Remaining ₹${c.remaining.toLocaleString('en-IN')} | Status: ${c.status} (${c.usagePercentage}% used)`
  )
  .join('\n')}

OVERSPENDING ALERTS:
${context.overspentCategories.length > 0 ? context.overspentCategories.join(', ') : 'None! All categories are within limit.'}

NEAR LIMIT WARNINGS (>= 80% used):
${context.nearLimitCategories.length > 0 ? context.nearLimitCategories.join(', ') : 'None.'}

RECENT TRANSACTIONS:
${context.topExpenses.map((e) => `- ${e.date}: ${e.title} (₹${e.amount.toLocaleString('en-IN')}) [${e.category}]`).join('\n')}

${
  context.simulation
    ? `
SIMULATION CALCULATION (Hypothetical - NOT SAVED):
Category: ${context.simulation.categoryName}
Current Budget: ₹${context.simulation.currentBudget}
Current Spending: ₹${context.simulation.currentSpending}
Hypothetical Expense: ₹${context.simulation.hypotheticalAmount}
Projected Spending: ₹${context.simulation.projectedSpending}
Projected Remaining: ₹${context.simulation.projectedRemaining}
Projected Status: ${context.simulation.projectedStatus}
Calculated Result: ${context.simulation.outcomeMessage}
${
  context.simulation.financialProfileImpact
    ? `Financial Profile Impact: ${context.simulation.financialProfileImpact.message}`
    : ''
}
`
    : ''
}

USER QUESTION:
"${userQuestion}"
`;
  }
}
export default ContextBuilder;
