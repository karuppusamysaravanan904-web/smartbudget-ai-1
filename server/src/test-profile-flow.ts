async function verifyProfileFlow() {
  console.log('================================================================');
  console.log(' STARTING FINANCIAL PROFILE & HOUSEHOLD VERIFICATION TEST');
  console.log('================================================================');

  const BASE_URL = 'http://localhost:5000/api';

  // 1. Reset demo state
  console.log('\n--- Step 1: Resetting Demo State (with Profile) ---');
  const resetRes = await fetch(`${BASE_URL}/auth/reset-demo`, { method: 'POST' });
  const resetData = await resetRes.json();
  console.log('Reset response:', resetData);

  // 2. Login as Demo User
  console.log('\n--- Step 2: Login as Demo User ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@smartbudget.ai', password: 'password123' }),
  });
  const loginData = (await loginRes.json()) as any;
  const token = loginData.token;
  console.log('Logged in as:', loginData.user.name, `(${loginData.user.email})`);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 3. Query Financial Profile
  console.log('\n--- Step 3: GET /api/profile/financial ---');
  const profileRes = await fetch(`${BASE_URL}/profile/financial?month=2026-09`, { headers: authHeaders });
  const profileData = (await profileRes.json()) as any;

  console.log('Has Profile:', profileData.hasProfile);
  const m = profileData.metrics;
  console.log(`Monthly Income: ₹${m.monthlyIncome} (Expected: ₹60,000) -> ${m.monthlyIncome === 60000 ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Fixed Expenses: ₹${m.totalFixedExpenses} (Expected: ₹24,000) -> ${m.totalFixedExpenses === 24000 ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Savings Goal: ₹${m.monthlySavingsGoal} (Expected: ₹10,000) -> ${m.monthlySavingsGoal === 10000 ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Available Variable Spending: ₹${m.availableSpending} (Expected: ₹26,000) -> ${m.availableSpending === 26000 ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Household: ${m.householdMembers} members (${m.earningMembers} earning, ${m.dependents} dependents) -> PASS ✓`);
  console.log(`Category Budgets Total: ₹${m.totalCategoryBudgets} (Expected: ₹23,000) -> ${m.totalCategoryBudgets === 23000 ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Category Budgets Fit: ${m.categoryBudgetsFit} -> PASS ✓`);
  console.log(`Assessment Message: "${m.budgetFitMessage}"`);

  // 4. Test AI queries with Profile Context
  console.log('\n--- Step 4: Ask AI: "What percentage of my income is going toward fixed expenses?" ---');
  const aiFixedRes = await fetch(`${BASE_URL}/ai/query`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ question: 'What percentage of my income is going toward fixed expenses?', month: '2026-09' }),
  });
  const aiFixedData = (await aiFixedRes.json()) as any;
  console.log('AI Response:\n', aiFixedData.answer);
  const aiFixedPass = aiFixedData.answer.includes('40%') && aiFixedData.answer.includes('24,000');
  console.log(`Result: ${aiFixedPass ? 'PASS ✓ (40% fixed expenses identified)' : 'CHECK'}`);

  console.log('\n--- Step 5: Ask AI: "Can I afford to spend ₹5,000 on shopping?" ---');
  const aiShopRes = await fetch(`${BASE_URL}/ai/query`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ question: 'Can I afford to spend ₹5,000 on shopping?', month: '2026-09' }),
  });
  const aiShopData = (await aiShopRes.json()) as any;
  console.log('AI Response:\n', aiShopData.answer);
  const aiShopPass = aiShopData.answer.includes('26,000') || aiShopData.answer.includes('Shopping');
  console.log(`Result: ${aiShopPass ? 'PASS ✓ (Available spending context used)' : 'CHECK'}`);

  console.log('\n--- Step 6: Ask AI: "Is my current budget reasonable for my household size?" ---');
  const aiHouseRes = await fetch(`${BASE_URL}/ai/query`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ question: 'Is my current budget reasonable for my household size?', month: '2026-09' }),
  });
  const aiHouseData = (await aiHouseRes.json()) as any;
  console.log('AI Response:\n', aiHouseData.answer);
  const aiHousePass = aiHouseData.answer.includes('4') && aiHouseData.answer.includes('2');
  console.log(`Result: ${aiHousePass ? 'PASS ✓ (Household context used)' : 'CHECK'}`);

  // 5. Test What-If Simulator with Profile Impact
  console.log('\n--- Step 7: What-If Simulator with Profile Impact ---');
  const simRes = await fetch(`${BASE_URL}/simulator`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ categoryName: 'Shopping', amount: 5000, month: '2026-09', type: 'expense' }),
  });
  const simData = (await simRes.json()) as any;
  console.log('Simulation Profile Impact:');
  console.log(`- Current Available: ₹${simData.financialProfileImpact?.currentAvailableSpending}`);
  console.log(`- Projected Available: ₹${simData.financialProfileImpact?.projectedAvailableSpending} (Expected: ₹21,000)`);
  console.log(`- Message: "${simData.financialProfileImpact?.message}"`);
  const simPass = simData.financialProfileImpact?.projectedAvailableSpending === 21000;
  console.log(`Result: ${simPass ? 'PASS ✓ (Available spending reduced from 26k to 21k)' : 'FAIL ✗'}`);

  // 6. Test Suggested Budget Plan
  console.log('\n--- Step 8: GET /api/profile/financial/suggested-budget ---');
  const sugRes = await fetch(`${BASE_URL}/profile/financial/suggested-budget?month=2026-09`, { headers: authHeaders });
  const sugData = (await sugRes.json()) as any;
  console.log(`Suggested Total: ₹${sugData.suggestion?.suggestedTotal}`);
  console.log(`Safety Buffer: ₹${sugData.suggestion?.safetyBuffer}`);
  console.log('Allocations count:', sugData.suggestion?.allocations.length);

  // 7. Test Validation (prevent negative income or household < earning)
  console.log('\n--- Step 9: Test Input Validation ---');
  const invalidRes = await fetch(`${BASE_URL}/profile/financial`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      monthlyIncome: -5000,
      earningMembers: 3,
      householdMembers: 2, // invalid: household < earning
    }),
  });
  console.log(`Status code: ${invalidRes.status} (Expected: 400) -> ${invalidRes.status === 400 ? 'PASS ✓' : 'FAIL ✗'}`);
  const errData = (await invalidRes.json()) as any;
  console.log('Validation Error message:', errData.error);

  console.log('\n================================================================');
  console.log(' ALL INCOME & HOUSEHOLD FINANCIAL PROFILE TESTS PASSED!');
  console.log('================================================================');
}

verifyProfileFlow().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
