import { MonthlyBudgetSummary } from './budgetService';

export interface HealthFactor {
  type: 'positive' | 'warning' | 'danger';
  text: string;
  impactScore: number;
}

export interface BudgetHealthResult {
  score: number; // 0 to 100
  tier: 'Excellent' | 'Good' | 'Fair' | 'Critical';
  factors: HealthFactor[];
  summary: string;
}

export class HealthScoreService {
  /**
   * Transparent calculation of Budget Health Score based on actual data
   */
  static calculateHealthScore(summary: MonthlyBudgetSummary): BudgetHealthResult {
    const factors: HealthFactor[] = [];
    let baseScore = 100;

    const {
      totalBudget,
      totalSpent,
      remaining,
      usagePercentage,
      categories,
      overspentCategories,
      nearLimitCategories,
      underBudgetCategories,
    } = summary;

    if (totalBudget === 0) {
      return {
        score: 50,
        tier: 'Fair',
        factors: [
          {
            type: 'warning',
            text: 'No active monthly budget allocated yet. Set up categories to calculate health.',
            impactScore: 0,
          },
        ],
        summary: 'Allocate budgets to categories to get a personalized health score.',
      };
    }

    // Factor 1: Overspending categories deduction (Each overspent category deducts up to 15-20 points)
    const overspentCount = overspentCategories.length;
    if (overspentCount === 0) {
      factors.push({
        type: 'positive',
        text: 'All categories are within budget limit',
        impactScore: +10,
      });
    } else {
      const penalty = Math.min(45, overspentCount * 18);
      baseScore -= penalty;
      factors.push({
        type: 'danger',
        text: `${overspentCount} ${overspentCount === 1 ? 'category is' : 'categories are'} currently over budget`,
        impactScore: -penalty,
      });
    }

    // Factor 2: Total budget utilization ratio
    if (usagePercentage > 100) {
      const excess = usagePercentage - 100;
      const penalty = Math.min(30, Math.round(excess * 1.5));
      baseScore -= penalty;
      factors.push({
        type: 'danger',
        text: `Total spending exceeds monthly budget by ${Math.round(excess)}%`,
        impactScore: -penalty,
      });
    } else if (usagePercentage >= 85) {
      baseScore -= 12;
      factors.push({
        type: 'warning',
        text: `High budget utilization (${usagePercentage}% used)`,
        impactScore: -12,
      });
    } else {
      const remainingPercent = Math.round(100 - usagePercentage);
      factors.push({
        type: 'positive',
        text: `${remainingPercent}% total budget remaining safely`,
        impactScore: +10,
      });
    }

    // Factor 3: Near limit categories
    const nearLimitCount = nearLimitCategories.length;
    if (nearLimitCount > 0) {
      const penalty = nearLimitCount * 6;
      baseScore -= penalty;
      factors.push({
        type: 'warning',
        text: `${nearLimitCount} ${nearLimitCount === 1 ? 'category' : 'categories'} nearing 80-100% capacity`,
        impactScore: -penalty,
      });
    } else {
      factors.push({
        type: 'positive',
        text: 'No categories are currently approaching warning limits',
        impactScore: +5,
      });
    }

    // Factor 4: Category distribution health
    const healthyCount = underBudgetCategories.length;
    if (healthyCount > 0) {
      factors.push({
        type: 'positive',
        text: `${healthyCount} ${healthyCount === 1 ? 'category is' : 'categories are'} well within safe spending limits`,
        impactScore: +5,
      });
    }

    // Normalize final score between 0 and 100
    const finalScore = Math.max(5, Math.min(100, Math.round(baseScore)));

    let tier: 'Excellent' | 'Good' | 'Fair' | 'Critical' = 'Fair';
    if (finalScore >= 85) tier = 'Excellent';
    else if (finalScore >= 70) tier = 'Good';
    else if (finalScore >= 50) tier = 'Fair';
    else tier = 'Critical';

    let summaryText = '';
    if (tier === 'Excellent') {
      summaryText = 'Outstanding financial discipline! You have strong buffer across all categories.';
    } else if (tier === 'Good') {
      summaryText = 'Solid financial management with manageable spending in most areas.';
    } else if (tier === 'Fair') {
      summaryText = 'Moderate budget pressure. Consider pausing non-essential discretionary expenses.';
    } else {
      summaryText = 'High financial strain detected. Immediate spending freeze recommended in overspent categories.';
    }

    return {
      score: finalScore,
      tier,
      factors,
      summary: summaryText,
    };
  }
}
export default HealthScoreService;
