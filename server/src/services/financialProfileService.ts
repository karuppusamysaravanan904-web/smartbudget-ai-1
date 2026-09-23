import prisma from '../config/prisma';
import { BudgetService } from './budgetService';

export interface CalculatedFinancialMetrics {
  monthlyIncome: number;
  incomeFrequency: string;
  earningMembers: number;
  householdMembers: number;
  dependents: number;
  children: number;
  adults: number;
  seniors: number;
  monthlyRent: number;
  monthlyEmi: number;
  monthlyUtilities: number;
  monthlyInsurance: number;
  otherFixedExpenses: number;
  totalFixedExpenses: number;
  monthlySavingsGoal: number;
  emergencyFundGoal?: number | null;
  availableSpending: number;
  totalCategoryBudgets: number;
  categoryBudgetsFit: boolean;
  budgetVariance: number; // positive = buffer, negative = deficit
  budgetFitMessage: string;
  fixedExpenseRatio: number;
  savingsRatio: number;
  variableSpendingRatio: number;
}

export interface SuggestedBudgetPlan {
  suggestedTotal: number;
  availableSpending: number;
  safetyBuffer: number;
  allocations: {
    categoryId: string;
    categoryName: string;
    currentBudget: number;
    suggestedBudget: number;
    reason: string;
  }[];
  rationale: string;
}

export class FinancialProfileService {
  /**
   * Get raw financial profile for a user
   */
  static async getRawProfile(userId: string) {
    return prisma.financialProfile.findUnique({
      where: { userId },
    });
  }

  /**
   * Compute full financial profile with mathematical metrics
   */
  static async getComputedProfile(userId: string, month: string): Promise<{
    profile: any | null;
    metrics: CalculatedFinancialMetrics | null;
    hasProfile: boolean;
  }> {
    const profile = await this.getRawProfile(userId);
    if (!profile) {
      return {
        profile: null,
        metrics: null,
        hasProfile: false,
      };
    }

    const summary = await BudgetService.getMonthlyBudgetSummary(userId, month);

    // 1. Total Fixed Expenses = Rent + EMI + Utilities + Insurance + Other Fixed
    const totalFixedExpenses =
      profile.monthlyRent +
      profile.monthlyEmi +
      profile.monthlyUtilities +
      profile.monthlyInsurance +
      profile.otherFixedExpenses;

    // 2. Available for Variable Spending = Monthly Income - Total Fixed Expenses - Monthly Savings Goal
    const availableSpending = Math.max(
      0,
      profile.monthlyIncome - totalFixedExpenses - profile.monthlySavingsGoal
    );

    // 3. Compare with planned category budgets
    const totalCategoryBudgets = summary.totalBudget;
    const categoryBudgetsFit = totalCategoryBudgets <= availableSpending;
    const budgetVariance = availableSpending - totalCategoryBudgets;

    let budgetFitMessage = '';
    if (totalCategoryBudgets === 0) {
      budgetFitMessage = 'No category budgets planned yet. You have ₹' + availableSpending.toLocaleString('en-IN') + ' available for spending.';
    } else if (categoryBudgetsFit) {
      budgetFitMessage = `✓ Your planned category budgets (₹${totalCategoryBudgets.toLocaleString('en-IN')}) fit within your available spending (₹${availableSpending.toLocaleString('en-IN')}). Buffer: ₹${budgetVariance.toLocaleString('en-IN')}.`;
    } else {
      const deficit = Math.abs(budgetVariance);
      budgetFitMessage = `⚠ Planned budgets (₹${totalCategoryBudgets.toLocaleString('en-IN')}) exceed available spending (₹${availableSpending.toLocaleString('en-IN')}) by ₹${deficit.toLocaleString('en-IN')}.`;
    }

    const income = profile.monthlyIncome > 0 ? profile.monthlyIncome : 1;
    const fixedExpenseRatio = Math.round((totalFixedExpenses / income) * 100);
    const savingsRatio = Math.round((profile.monthlySavingsGoal / income) * 100);
    const variableSpendingRatio = Math.round((availableSpending / income) * 100);

    const metrics: CalculatedFinancialMetrics = {
      monthlyIncome: profile.monthlyIncome,
      incomeFrequency: profile.incomeFrequency,
      earningMembers: profile.earningMembers,
      householdMembers: profile.householdMembers,
      dependents: profile.dependents,
      children: profile.children,
      adults: profile.adults,
      seniors: profile.seniors,
      monthlyRent: profile.monthlyRent,
      monthlyEmi: profile.monthlyEmi,
      monthlyUtilities: profile.monthlyUtilities,
      monthlyInsurance: profile.monthlyInsurance,
      otherFixedExpenses: profile.otherFixedExpenses,
      totalFixedExpenses: Math.round(totalFixedExpenses * 100) / 100,
      monthlySavingsGoal: profile.monthlySavingsGoal,
      emergencyFundGoal: profile.emergencyFundGoal,
      availableSpending: Math.round(availableSpending * 100) / 100,
      totalCategoryBudgets: Math.round(totalCategoryBudgets * 100) / 100,
      categoryBudgetsFit,
      budgetVariance: Math.round(budgetVariance * 100) / 100,
      budgetFitMessage,
      fixedExpenseRatio,
      savingsRatio,
      variableSpendingRatio,
    };

    return {
      profile,
      metrics,
      hasProfile: true,
    };
  }

  /**
   * Save or update financial profile
   */
  static async upsertProfile(userId: string, data: any) {
    const monthlyIncome = Math.max(0, parseFloat(data.monthlyIncome || 0));
    const incomeFrequency = data.incomeFrequency || 'monthly';
    const earningMembers = Math.max(1, parseInt(data.earningMembers || 1, 10));
    const householdMembers = Math.max(earningMembers, parseInt(data.householdMembers || earningMembers, 10));
    const dependents = Math.max(0, parseInt(data.dependents || 0, 10));
    const children = Math.max(0, parseInt(data.children || 0, 10));
    const adults = Math.max(1, parseInt(data.adults || 1, 10));
    const seniors = Math.max(0, parseInt(data.seniors || 0, 10));

    const monthlyRent = Math.max(0, parseFloat(data.monthlyRent || 0));
    const monthlyEmi = Math.max(0, parseFloat(data.monthlyEmi || 0));
    const monthlyUtilities = Math.max(0, parseFloat(data.monthlyUtilities || 0));
    const monthlyInsurance = Math.max(0, parseFloat(data.monthlyInsurance || 0));
    const otherFixedExpenses = Math.max(0, parseFloat(data.otherFixedExpenses || 0));
    const monthlySavingsGoal = Math.max(0, parseFloat(data.monthlySavingsGoal || 0));
    const emergencyFundGoal = data.emergencyFundGoal ? Math.max(0, parseFloat(data.emergencyFundGoal)) : null;

    return prisma.financialProfile.upsert({
      where: { userId },
      update: {
        monthlyIncome,
        incomeFrequency,
        earningMembers,
        householdMembers,
        dependents,
        children,
        adults,
        seniors,
        monthlyRent,
        monthlyEmi,
        monthlyUtilities,
        monthlyInsurance,
        otherFixedExpenses,
        monthlySavingsGoal,
        emergencyFundGoal,
      },
      create: {
        userId,
        monthlyIncome,
        incomeFrequency,
        earningMembers,
        householdMembers,
        dependents,
        children,
        adults,
        seniors,
        monthlyRent,
        monthlyEmi,
        monthlyUtilities,
        monthlyInsurance,
        otherFixedExpenses,
        monthlySavingsGoal,
        emergencyFundGoal,
      },
    });
  }

  /**
   * Delete financial profile
   */
  static async deleteProfile(userId: string) {
    return prisma.financialProfile.deleteMany({
      where: { userId },
    });
  }

  /**
   * Generate AI Suggested Budget Plan based on financial profile and spending history
   */
  static async generateSuggestedBudget(userId: string, month: string): Promise<SuggestedBudgetPlan | null> {
    const { profile, metrics } = await this.getComputedProfile(userId, month);
    if (!profile || !metrics) return null;

    const summary = await BudgetService.getMonthlyBudgetSummary(userId, month);
    const availableSpending = metrics.availableSpending;

    // Standard baseline weights tailored to household size and dependents
    // E.g. larger household requires higher food/healthcare/education proportion
    const allocations: SuggestedBudgetPlan['allocations'] = [];
    let allocatedTotal = 0;

    // Target total suggested budget leaving ~15% buffer of available spending
    const targetSpendingPool = Math.round(availableSpending * 0.85);

    // Determine category weights
    const hasChildren = profile.children > 0 || profile.dependents > 0;
    const foodShare = profile.householdMembers >= 4 ? 0.35 : 0.30;
    const travelShare = 0.18;
    const eduShare = hasChildren ? 0.20 : 0.12;
    const entertainmentShare = 0.12;
    const shoppingShare = 0.10;
    const otherShare = 0.08;

    const targetCategories = [
      { name: 'Food', share: foodShare, reason: `Calibrated for ${profile.householdMembers} household members (${profile.dependents} dependents)` },
      { name: 'Travel', share: travelShare, reason: 'Commute and local mobility allowance' },
      { name: 'Education', share: eduShare, reason: hasChildren ? 'Curriculum and enrichment support for dependents' : 'Professional upskilling' },
      { name: 'Entertainment', share: entertainmentShare, reason: 'Discretionary leisure and recreation' },
      { name: 'Shopping', share: shoppingShare, reason: 'Household goods and personal apparel' },
      { name: 'Other', share: otherShare, reason: 'Unforeseen miscellaneous day-to-day outlays' },
    ];

    const allCategories = await BudgetService.getUserCategories(userId);

    for (const target of targetCategories) {
      const matched = allCategories.find((c) => c.name.toLowerCase() === target.name.toLowerCase());
      if (!matched) continue;

      const existingCatBudget = summary.categories.find((c) => c.categoryId === matched.id);
      const currentBudget = existingCatBudget ? existingCatBudget.budgetAmount : 0;

      // Round to nearest 500
      const suggestedAmount = Math.max(1000, Math.round((targetSpendingPool * target.share) / 500) * 500);
      allocatedTotal += suggestedAmount;

      allocations.push({
        categoryId: matched.id,
        categoryName: matched.name,
        currentBudget,
        suggestedBudget: suggestedAmount,
        reason: target.reason,
      });
    }

    const safetyBuffer = Math.max(0, availableSpending - allocatedTotal);

    return {
      suggestedTotal: allocatedTotal,
      availableSpending,
      safetyBuffer,
      allocations,
      rationale: `Based on your monthly household income of ₹${profile.monthlyIncome.toLocaleString('en-IN')}, fixed expenses of ₹${metrics.totalFixedExpenses.toLocaleString('en-IN')}, and monthly savings goal of ₹${profile.monthlySavingsGoal.toLocaleString('en-IN')}, you have ₹${availableSpending.toLocaleString('en-IN')} available for variable spending. This plan allocates ₹${allocatedTotal.toLocaleString('en-IN')} across key categories, leaving a safe discretionary cushion of ₹${safetyBuffer.toLocaleString('en-IN')}.`,
    };
  }
}
export default FinancialProfileService;
