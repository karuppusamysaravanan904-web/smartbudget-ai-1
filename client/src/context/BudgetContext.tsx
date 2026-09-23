import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

export interface CategoryDetail {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  budgetId?: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercentage: number;
  status: 'UNDER BUDGET' | 'NEAR LIMIT' | 'OVER BUDGET';
  overspentAmount: number;
  expenseCount: number;
}

export interface MonthlySummary {
  month: string;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  usagePercentage: number;
  status: 'UNDER BUDGET' | 'NEAR LIMIT' | 'OVER BUDGET';
  categories: CategoryDetail[];
  overspentCategories: CategoryDetail[];
  nearLimitCategories: CategoryDetail[];
  underBudgetCategories: CategoryDetail[];
}

export interface FinancialProfileMetrics {
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
  budgetVariance: number;
  budgetFitMessage: string;
  fixedExpenseRatio: number;
  savingsRatio: number;
  variableSpendingRatio: number;
}

interface BudgetContextType {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  summary: MonthlySummary | null;
  categories: any[];
  healthScore: any | null;
  insights: any[];
  financialProfile: any | null;
  profileMetrics: FinancialProfileMetrics | null;
  hasProfile: boolean;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // Default to September 2026 for Step 31/32 Hackathon Demo alignment
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<any | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [financialProfile, setFinancialProfile] = useState<any | null>(null);
  const [profileMetrics, setProfileMetrics] = useState<FinancialProfileMetrics | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [sumRes, catRes, healthRes, insRes, profileRes] = await Promise.all([
        api.getBudgetSummary(selectedMonth),
        api.getCategories(),
        api.getHealthScore(selectedMonth),
        api.getInsights(selectedMonth),
        api.getFinancialProfile(selectedMonth).catch(() => ({ profile: null, metrics: null, hasProfile: false })),
      ]);

      setSummary(sumRes);
      setCategories(catRes);
      setHealthScore(healthRes.health);
      setInsights(insRes.insights);
      if (profileRes) {
        setFinancialProfile(profileRes.profile);
        setProfileMetrics(profileRes.metrics);
        setHasProfile(!!profileRes.hasProfile);
      }
    } catch (err) {
      console.error('Failed to load budget data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedMonth]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <BudgetContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        summary,
        categories,
        healthScore,
        insights,
        financialProfile,
        profileMetrics,
        hasProfile,
        loading,
        refreshData,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) throw new Error('useBudget must be used within a BudgetProvider');
  return context;
};
