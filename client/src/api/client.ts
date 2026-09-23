import {
  MOCK_USER,
  MOCK_CATEGORIES,
  MOCK_BUDGET_SUMMARY,
  MOCK_EXPENSES,
  MOCK_FINANCIAL_PROFILE,
  MOCK_HEALTH_SCORE,
  MOCK_INSIGHTS,
} from './mockData';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('smartbudget_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('smartbudget_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('smartbudget_token');
};

function handleOfflineFallback<T>(endpoint: string, options: RequestInit = {}): T {
  console.info(`[SmartBudget AI Offline Demo Mode] Serving fallback for ${endpoint}`);
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  if (endpoint.startsWith('/auth/me')) {
    return { user: MOCK_USER } as T;
  }
  if (endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register')) {
    setAuthToken('offline_demo_token');
    return { token: 'offline_demo_token', user: MOCK_USER } as T;
  }
  if (endpoint.startsWith('/auth/reset-demo')) {
    return { message: 'Demo reset' } as T;
  }
  if (endpoint.startsWith('/budgets/summary')) {
    return MOCK_BUDGET_SUMMARY as T;
  }
  if (endpoint.startsWith('/categories')) {
    return MOCK_CATEGORIES as T;
  }
  if (endpoint.startsWith('/expenses')) {
    if (method === 'POST') {
      return { id: `exp_${Date.now()}`, ...body } as T;
    }
    return MOCK_EXPENSES as T;
  }
  if (endpoint.startsWith('/profile/financial/suggested-budget')) {
    return {
      monthlyIncome: 60000,
      totalFixedExpenses: 24000,
      monthlySavingsGoal: 10000,
      availableSpending: 26000,
      suggestedTotal: 22500,
      safetyBuffer: 3500,
      allocations: [
        { categoryName: 'Food & Dining', suggestedAmount: 8500, percentageOfAvailable: 32.7, rationale: 'Essential nutrition & groceries' },
        { categoryName: 'Travel & Transport', suggestedAmount: 5500, percentageOfAvailable: 21.2, rationale: 'Work commutes & daily transit' },
        { categoryName: 'Education', suggestedAmount: 4500, percentageOfAvailable: 17.3, rationale: 'Tuition & skill development' },
        { categoryName: 'Healthcare', suggestedAmount: 2000, percentageOfAvailable: 7.7, rationale: 'Emergency medical fund' },
        { categoryName: 'Entertainment', suggestedAmount: 2000, percentageOfAvailable: 7.7, rationale: 'Discretionary leisure & media' },
      ],
    } as T;
  }
  if (endpoint.startsWith('/profile/financial')) {
    if (method === 'POST') {
      return { ...MOCK_FINANCIAL_PROFILE, ...body } as T;
    }
    if (method === 'DELETE') {
      return { message: 'Profile deleted' } as T;
    }
    return MOCK_FINANCIAL_PROFILE as T;
  }
  if (endpoint.startsWith('/ai/health')) {
    return MOCK_HEALTH_SCORE as T;
  }
  if (endpoint.startsWith('/ai/insights')) {
    return MOCK_INSIGHTS as T;
  }
  if (endpoint.startsWith('/ai/recommendations')) {
    return [
      {
        id: 'rec_1',
        title: 'Increase Travel Budget',
        categoryName: 'Travel & Transport',
        currentBudget: 5000,
        suggestedBudget: 7000,
        reason: 'Consistently exceeded by ₹1,200.',
        priority: 'high',
      },
    ] as T;
  }
  if (endpoint.startsWith('/ai/history')) {
    return [] as T;
  }
  if (endpoint.startsWith('/ai/query')) {
    const q = (body.question || '').toLowerCase();
    let reply = `Based on your live September 2026 data, your total budget is ₹23,000, total spent is ₹19,400, and remaining buffer is ₹3,600.`;
    if (q.includes('overspend') || q.includes('exceed')) {
      reply = `You have exceeded your limit in **Travel & Transport** by **₹1,200** (Spent ₹6,200 of ₹5,000 budget). Other categories remain within limits.`;
    } else if (q.includes('food')) {
      reply = `You have spent **₹6,500** of your **₹8,000** Food budget. You still have **₹1,500** remaining (81.3% utilization).`;
    } else if (q.includes('fixed') || q.includes('ratio')) {
      reply = `Based on your Financial Profile, **40%** (₹24,000 / ₹60,000) of your income goes to fixed commitments (Rent: ₹12k, EMI: ₹5k, Utilities: ₹3k, Insurance: ₹2k, Other: ₹2k).`;
    } else if (q.includes('household')) {
      reply = `For your household of **4 members** (2 earning, 2 dependents), your available variable spending of **₹26,000** provides approximately **₹6,500 per member**, which is healthy and well-allocated.`;
    }
    return { answer: reply, conversationId: 'conv_offline' } as T;
  }
  if (endpoint.startsWith('/simulator')) {
    const catName = body.categoryName || 'Discretionary';
    const amount = Number(body.amount) || 1000;
    return {
      simulationId: `sim_${Date.now()}`,
      label: 'Hypothetical Expense Simulation',
      isHypothetical: true,
      categoryName: catName,
      hypotheticalAmount: amount,
      currentBudget: 5000,
      currentSpent: 6200,
      projectedSpent: 6200 + amount,
      projectedRemaining: 5000 - (6200 + amount),
      projectedUsagePercentage: 144,
      riskLevel: 'HIGH',
      financialProfileImpact: {
        currentAvailable: 26000,
        projectedAvailable: Math.max(0, 26000 - amount),
        message: `Your available variable spending reduces from ₹26,000 to ₹${(26000 - amount).toLocaleString('en-IN')}.`,
      },
    } as T;
  }
  if (endpoint.startsWith('/reports/monthly')) {
    return {
      month: '2026-09',
      summary: MOCK_BUDGET_SUMMARY,
      healthScore: MOCK_HEALTH_SCORE,
      financialProfile: MOCK_FINANCIAL_PROFILE,
    } as T;
  }

  return {} as T;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      clearAuthToken();
      window.dispatchEvent(new Event('auth:unauthorized'));
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      // If deployed on static host (like GitHub Pages) where API returns 404
      if (response.status === 404 || response.status === 405) {
        return handleOfflineFallback<T>(endpoint, options);
      }

      let errorMsg = 'An unexpected error occurred.';
      try {
        const errData = await response.json();
        errorMsg = errData.error || errData.message || errorMsg;
      } catch {
        errorMsg = await response.text();
      }
      throw new Error(errorMsg);
    }

    // Check if response is HTML (happens on static SPAs when 404 falls back to index.html)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      return handleOfflineFallback<T>(endpoint, options);
    }

    return response.json();
  } catch (err: any) {
    // If network error (Failed to fetch) or static host without backend
    if (err?.name === 'TypeError' || err?.message?.includes('Failed to fetch')) {
      return handleOfflineFallback<T>(endpoint, options);
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  resetDemo: () => request<any>('/auth/reset-demo', { method: 'POST' }),

  // Budgets
  getBudgetSummary: (month: string) => request<any>(`/budgets/summary?month=${month}`),
  upsertBudget: (data: { categoryId: string; month: string; amount: number }) =>
    request<any>('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  deleteBudget: (id: string) => request<any>(`/budgets/${id}`, { method: 'DELETE' }),
  copyMonthBudgets: (sourceMonth: string, targetMonth: string) =>
    request<any>('/budgets/copy-month', { method: 'POST', body: JSON.stringify({ sourceMonth, targetMonth }) }),

  // Expenses
  getExpenses: (params: { month?: string; categoryId?: string; search?: string; sortBy?: string; sortOrder?: string }) => {
    const q = new URLSearchParams();
    if (params.month) q.append('month', params.month);
    if (params.categoryId && params.categoryId !== 'all') q.append('categoryId', params.categoryId);
    if (params.search) q.append('search', params.search);
    if (params.sortBy) q.append('sortBy', params.sortBy);
    if (params.sortOrder) q.append('sortOrder', params.sortOrder);
    return request<any[]>(`/expenses?${q.toString()}`);
  },
  createExpense: (data: any) => request<any>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id: string, data: any) => request<any>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id: string) => request<any>(`/expenses/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<any[]>('/categories'),
  createCategory: (data: { name: string; icon?: string; color?: string }) =>
    request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),

  // Simulator
  simulate: (data: { categoryId?: string; categoryName?: string; amount: number; month: string; type?: string }) =>
    request<any>('/simulator', { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  getMonthlyReport: (month: string) => request<any>(`/reports/monthly?month=${month}`),
  getCsvExportUrl: (month: string) => `${API_BASE}/reports/export-csv?month=${month}`,
  getAiExplanation: (month: string) => request<any>(`/reports/ai-explanation?month=${month}`),

  // AI Assistant & Intelligence
  askBudgetAI: (data: { question: string; month: string; conversationId?: string }) =>
    request<any>('/ai/query', { method: 'POST', body: JSON.stringify(data) }),
  getInsights: (month: string) => request<any>(`/ai/insights?month=${month}`),
  getHealthScore: (month: string) => request<any>(`/ai/health?month=${month}`),
  getRecommendations: (month: string) => request<any>(`/ai/recommendations?month=${month}`),
  getChatHistory: () => request<any[]>('/ai/history'),
  clearChatHistory: () => request<any>('/ai/clear', { method: 'DELETE' }),

  // Financial Profile (Income & Household)
  getFinancialProfile: (month?: string) =>
    request<any>(`/profile/financial${month ? `?month=${month}` : ''}`),
  saveFinancialProfile: (data: any, month?: string) =>
    request<any>(`/profile/financial${month ? `?month=${month}` : ''}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteFinancialProfile: () =>
    request<any>('/profile/financial', { method: 'DELETE' }),
  getSuggestedBudgetFromProfile: (month?: string) =>
    request<any>(`/profile/financial/suggested-budget${month ? `?month=${month}` : ''}`),
};

export default api;
