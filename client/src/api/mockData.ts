// Standalone Mock Dataset for GitHub Pages & Static Previews
// Ensures SmartBudget AI functions flawlessly even without a running Node.js backend server.

export const MOCK_USER = {
  id: 'usr_demo_2026',
  email: 'demo@smartbudget.ai',
  name: 'Alex Rivera',
  currency: 'INR',
  avatarUrl: null,
};

export const MOCK_CATEGORIES = [
  { id: 'cat_food', name: 'Food & Dining', icon: 'Utensils', color: '#10b981', isDefault: true },
  { id: 'cat_travel', name: 'Travel & Transport', icon: 'Plane', color: '#f59e0b', isDefault: true },
  { id: 'cat_edu', name: 'Education', icon: 'GraduationCap', color: '#3b82f6', isDefault: true },
  { id: 'cat_ent', name: 'Entertainment', icon: 'Film', color: '#ec4899', isDefault: true },
  { id: 'cat_house', name: 'Housing & Rent', icon: 'Home', color: '#8b5cf6', isDefault: true },
  { id: 'cat_util', name: 'Bills & Utilities', icon: 'Zap', color: '#06b6d4', isDefault: true },
  { id: 'cat_health', name: 'Healthcare', icon: 'HeartPulse', color: '#ef4444', isDefault: true },
  { id: 'cat_shop', name: 'Shopping', icon: 'ShoppingBag', color: '#f97316', isDefault: true },
];

export const MOCK_BUDGET_SUMMARY = {
  month: '2026-09',
  totalBudget: 23000,
  totalSpent: 19400,
  remaining: 3600,
  usagePercentage: 84.3,
  status: 'NEAR_LIMIT',
  categories: [
    {
      categoryId: 'cat_food',
      categoryName: 'Food & Dining',
      categoryIcon: 'Utensils',
      categoryColor: '#10b981',
      budgetAmount: 8000,
      spentAmount: 6500,
      remainingAmount: 1500,
      usagePercentage: 81.3,
      status: 'NEAR_LIMIT',
      budgetId: 'bgt_food',
      isOverBudget: false,
      isNearLimit: true,
      isUnderBudget: false,
    },
    {
      categoryId: 'cat_travel',
      categoryName: 'Travel & Transport',
      categoryIcon: 'Plane',
      categoryColor: '#f59e0b',
      budgetAmount: 5000,
      spentAmount: 6200,
      remainingAmount: -1200,
      usagePercentage: 124.0,
      status: 'OVER_BUDGET',
      budgetId: 'bgt_travel',
      isOverBudget: true,
      isNearLimit: false,
      isUnderBudget: false,
    },
    {
      categoryId: 'cat_edu',
      categoryName: 'Education',
      categoryIcon: 'GraduationCap',
      categoryColor: '#3b82f6',
      budgetAmount: 7000,
      spentAmount: 4000,
      remainingAmount: 3000,
      usagePercentage: 57.1,
      status: 'UNDER_BUDGET',
      budgetId: 'bgt_edu',
      isOverBudget: false,
      isNearLimit: false,
      isUnderBudget: true,
    },
    {
      categoryId: 'cat_ent',
      categoryName: 'Entertainment',
      categoryIcon: 'Film',
      categoryColor: '#ec4899',
      budgetAmount: 3000,
      spentAmount: 2700,
      remainingAmount: 300,
      usagePercentage: 90.0,
      status: 'NEAR_LIMIT',
      budgetId: 'bgt_ent',
      isOverBudget: false,
      isNearLimit: true,
      isUnderBudget: false,
    },
  ],
};

export const MOCK_EXPENSES = [
  { id: 'exp_1', amount: 2500, description: 'Supermarket Groceries', categoryId: 'cat_food', categoryName: 'Food & Dining', date: '2026-09-02', paymentMethod: 'UPI' },
  { id: 'exp_2', amount: 3200, description: 'Fuel & Highway Tolls', categoryId: 'cat_travel', categoryName: 'Travel & Transport', date: '2026-09-05', paymentMethod: 'Credit Card' },
  { id: 'exp_3', amount: 4000, description: 'Online Certification Course', categoryId: 'cat_edu', categoryName: 'Education', date: '2026-09-10', paymentMethod: 'Debit Card' },
  { id: 'exp_4', amount: 1500, description: 'Weekend Cinema & Snacks', categoryId: 'cat_ent', categoryName: 'Entertainment', date: '2026-09-12', paymentMethod: 'UPI' },
  { id: 'exp_5', amount: 1800, description: 'Mid-month Grocery Refill', categoryId: 'cat_food', categoryName: 'Food & Dining', date: '2026-09-15', paymentMethod: 'UPI' },
  { id: 'exp_6', amount: 3000, description: 'Train Tickets for Family Visit', categoryId: 'cat_travel', categoryName: 'Travel & Transport', date: '2026-09-18', paymentMethod: 'Credit Card' },
  { id: 'exp_7', amount: 1200, description: 'Streaming Services & Music Subscriptions', categoryId: 'cat_ent', categoryName: 'Entertainment', date: '2026-09-20', paymentMethod: 'Credit Card' },
  { id: 'exp_8', amount: 2200, description: 'Dinner with Colleagues', categoryId: 'cat_food', categoryName: 'Food & Dining', date: '2026-09-22', paymentMethod: 'UPI' },
];

export const MOCK_FINANCIAL_PROFILE = {
  id: 'prof_demo',
  userId: 'usr_demo_2026',
  monthlyIncome: 60000,
  rent: 12000,
  emi: 5000,
  utilities: 3000,
  insurance: 2000,
  otherFixed: 2000,
  monthlySavingsGoal: 10000,
  householdMembers: 4,
  earningMembers: 2,
  dependentsCount: 2,
  notes: 'Pre-seeded hackathon profile: Family of 4, two earners, two school children.',
  totalFixedExpenses: 24000,
  availableSpending: 26000,
  fixedExpenseRatio: 40,
  savingsRatio: 16.7,
  variableSpendingRatio: 43.3,
  householdRatio: 2,
  totalCategoryBudgets: 23000,
  categoryBudgetsFit: true,
  budgetFitDifference: 3000,
  budgetFitMessage: '✓ Your planned category budgets (₹23,000) fit within your available spending (₹26,000). Buffer: ₹3,000.',
};

export const MOCK_HEALTH_SCORE = {
  score: 72,
  grade: 'GOOD',
  factors: [
    { title: 'Budget Fit', status: 'PASS', description: 'Category budgets fit comfortably within available income' },
    { title: 'Fixed Commitments', status: 'PASS', description: 'Fixed commitments consume 40% of income (safe below 50%)' },
    { title: 'Discipline Risk', status: 'WARNING', description: '1 category (Travel) has exceeded its allocated limit' },
    { title: 'Runway Balance', status: 'PASS', description: '₹3,600 buffer remaining in current month' },
  ],
};

export const MOCK_INSIGHTS = [
  {
    type: 'OVERSPENDING',
    severity: 'high',
    title: 'Travel Over Budget',
    message: 'You have exceeded your Travel budget by ₹1,200 (124% utilization). Consider reallocating surplus from Education.',
  },
  {
    type: 'SAVINGS_PACING',
    severity: 'info',
    title: 'Strong Savings Rate',
    message: 'Your monthly savings target of ₹10,000 represents 16.7% of gross income, beating recommended baselines.',
  },
  {
    type: 'NEAR_LIMIT',
    severity: 'warning',
    title: 'Entertainment at 90%',
    message: 'Entertainment has only ₹300 remaining for the rest of September 2026.',
  },
];
