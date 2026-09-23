import { MonthlyBudgetSummary, CategoryBudgetDetail } from './budgetService';

export interface SmartInsight {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  categoryName?: string;
  metric?: string;
}

export class InsightsService {
  /**
   * Automatically generate 3-5 real-data insights from the monthly summary
   */
  static generateInsights(summary: MonthlyBudgetSummary, currency = '₹'): SmartInsight[] {
    const insights: SmartInsight[] = [];
    const {
      totalBudget,
      totalSpent,
      remaining,
      usagePercentage,
      overspentCategories,
      nearLimitCategories,
      underBudgetCategories,
      categories,
    } = summary;

    if (totalBudget === 0 && totalSpent === 0) {
      return [
        {
          id: 'welcome-insight',
          type: 'info',
          title: 'Ready for Planning',
          message: 'Set your monthly category limits to activate real-time AI spending insights.',
        },
      ];
    }

    // 1. Overspending Alerts
    overspentCategories.forEach((cat) => {
      insights.push({
        id: `overspend-${cat.categoryId}`,
        type: 'danger',
        title: 'Overspending Alert',
        message: `You have exceeded your ${cat.categoryName} budget by ${currency}${cat.overspentAmount.toLocaleString('en-IN')}.`,
        categoryName: cat.categoryName,
        metric: `Spent: ${currency}${cat.spentAmount.toLocaleString('en-IN')} / Limit: ${currency}${cat.budgetAmount.toLocaleString('en-IN')}`,
      });
    });

    // 2. Near Limit Warnings
    nearLimitCategories.forEach((cat) => {
      insights.push({
        id: `near-limit-${cat.categoryId}`,
        type: 'warning',
        title: 'Near Limit Warning',
        message: `You have used ${cat.usagePercentage}% of your ${cat.categoryName} budget. Only ${currency}${cat.remainingAmount.toLocaleString('en-IN')} remaining.`,
        categoryName: cat.categoryName,
        metric: `${cat.usagePercentage}% utilized`,
      });
    });

    // 3. Spending Pattern / Concentration Insight
    if (totalSpent > 0 && categories.length > 0) {
      // Find top spending category
      const sortedBySpent = [...categories].sort((a, b) => b.spentAmount - a.spentAmount);
      const topSpent = sortedBySpent[0];
      if (topSpent && topSpent.spentAmount > 0) {
        const share = Math.round((topSpent.spentAmount / totalSpent) * 100);
        if (share >= 25) {
          insights.push({
            id: `pattern-${topSpent.categoryId}`,
            type: 'info',
            title: 'Spending Pattern',
            message: `${topSpent.categoryName} accounts for ${share}% of your total spending this month.`,
            categoryName: topSpent.categoryName,
            metric: `${share}% of total outlays`,
          });
        }
      }
    }

    // 4. Positive Insights
    if (underBudgetCategories.length > 0) {
      const bestCategory = [...underBudgetCategories].sort((a, b) => b.remainingAmount - a.remainingAmount)[0];
      if (bestCategory && bestCategory.remainingAmount > 0) {
        insights.push({
          id: `positive-${bestCategory.categoryId}`,
          type: 'success',
          title: 'Positive Insight',
          message: `You are comfortably within budget for ${bestCategory.categoryName} with ${currency}${bestCategory.remainingAmount.toLocaleString('en-IN')} remaining.`,
          categoryName: bestCategory.categoryName,
          metric: `${currency}${bestCategory.remainingAmount.toLocaleString('en-IN')} safe buffer`,
        });
      }
    }

    // 5. Overall Planning Insight
    if (remaining > 0) {
      insights.push({
        id: 'planning-remaining',
        type: 'info',
        title: 'Planning Insight',
        message: `Your remaining total budget is ${currency}${remaining.toLocaleString('en-IN')} for the rest of the month.`,
        metric: `${Math.round(100 - usagePercentage)}% unallocated runway`,
      });
    } else if (remaining < 0) {
      insights.push({
        id: 'planning-deficit',
        type: 'danger',
        title: 'Overall Deficit Alert',
        message: `You are currently ${currency}${Math.abs(remaining).toLocaleString('en-IN')} over your total monthly allocated limit.`,
        metric: `${usagePercentage}% total usage`,
      });
    }

    // Return the top 4 most pertinent insights (danger & warning first)
    return insights.slice(0, 5);
  }
}
export default InsightsService;
