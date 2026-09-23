import { IAIProvider, AIProviderResponse } from './aiProviderInterface';
import { UserFinancialContext } from '../contextBuilder';

export class LocalAIProvider implements IAIProvider {
  name = 'SmartBudget Local AI';

  async generateResponse(
    systemPrompt: string,
    userQuestion: string,
    context: UserFinancialContext
  ): Promise<AIProviderResponse> {
    const q = userQuestion.toLowerCase().trim();

    // Check if there is an active simulation in the context
    if (context.simulation) {
      const sim = context.simulation;
      const isOver = sim.isOverBudget;
      const overBy = Math.max(0, sim.projectedSpending - sim.projectedBudget);

      const simAnswer = `**[SIMULATION — NOT SAVED]**

Here is what happens if you spend **₹${sim.hypotheticalAmount.toLocaleString('en-IN')}** on **${sim.categoryName}**:

- **Current ${sim.categoryName} Budget:** ₹${sim.currentBudget.toLocaleString('en-IN')}
- **Current Spending:** ₹${sim.currentSpending.toLocaleString('en-IN')}
- **Hypothetical Expense:** ₹${sim.hypotheticalAmount.toLocaleString('en-IN')}
- **Projected Spending:** ₹${sim.projectedSpending.toLocaleString('en-IN')}
- **Projected Remaining:** ₹${sim.projectedRemaining.toLocaleString('en-IN')}

**Result:**
${
  isOver
    ? `Your **${sim.categoryName}** budget would exceed the limit by **₹${overBy.toLocaleString('en-IN')}** (Utilization: ${sim.projectedUsagePercentage}%).`
    : `You can safely afford this expense! You will still have **₹${sim.projectedRemaining.toLocaleString('en-IN')}** remaining in your ${sim.categoryName} budget.`
}

*(Note: This is an exploratory simulation. Your actual accounts and expenses have not been modified.)*`;

      return {
        answer: simAnswer,
        provider: this.name,
        isSimulation: true,
        simulationDetails: sim,
      };
    }

    // Question 1: "Where am I overspending?" / "Am I over budget?"
    if (
      q.includes('where am i overspending') ||
      q.includes('overspending') ||
      q.includes('over budget') ||
      q.includes('exceeded')
    ) {
      if (context.overspentCategories.length > 0) {
        const details = context.categories
          .filter((c) => c.status === 'OVER BUDGET')
          .map(
            (c) =>
              `- **${c.name}**: Allocated **₹${c.budget.toLocaleString('en-IN')}**, but spent **₹${c.spent.toLocaleString('en-IN')}** (Exceeded by **₹${c.overspentAmount.toLocaleString('en-IN')}**)`
          )
          .join('\n');

        return {
          answer: `Based on your live records for **${context.month}**, you are currently overspending in **${context.overspentCategories.length}** category:\n\n${details}\n\n**Recommendation:** Consider pausing discretionary expenses in ${context.overspentCategories.map((c) => c.split(' ')[0]).join(', ')} or adjusting your allocated budget if spending requirements have changed.`,
          provider: this.name,
        };
      } else {
        return {
          answer: `Great news! You have **no overspent categories** for **${context.month}**. All your expenses are within their allocated monthly limits. Your total remaining budget is **₹${context.remaining.toLocaleString('en-IN')}**.`,
          provider: this.name,
        };
      }
    }

    // Question 2: "How much can I still spend on food?" / category inquiry
    const categoryMatches = context.categories.find(
      (c) => q.includes(c.name.toLowerCase()) || (c.name === 'Food' && (q.includes('dinner') || q.includes('groceries') || q.includes('lunch')))
    );

    if (categoryMatches) {
      const cat = categoryMatches;
      // Check if user is asking "Am I still over budget on travel/food?"
      if (q.includes('still over') || q.includes('am i over')) {
        if (cat.status === 'OVER BUDGET') {
          return {
            answer: `Yes, you are currently over budget on **${cat.name}**. Your allocated budget is **₹${cat.budget.toLocaleString('en-IN')}** and you have spent **₹${cat.spent.toLocaleString('en-IN')}**, exceeding it by **₹${cat.overspentAmount.toLocaleString('en-IN')}**.`,
            provider: this.name,
          };
        } else {
          return {
            answer: `No, you are **within budget** for **${cat.name}**! Your budget is **₹${cat.budget.toLocaleString('en-IN')}**, you have spent **₹${cat.spent.toLocaleString('en-IN')}**, leaving a positive remaining balance of **₹${cat.remaining.toLocaleString('en-IN')}** (${cat.usagePercentage}% used).`,
            provider: this.name,
          };
        }
      }

      // Check if user asks "How much can I spend on X?"
      return {
        answer: `For **${cat.name}** in ${context.month}:\n- **Allocated Budget:** ₹${cat.budget.toLocaleString('en-IN')}\n- **Actual Spent:** ₹${cat.spent.toLocaleString('en-IN')}\n- **Remaining Balance:** **₹${cat.remaining.toLocaleString('en-IN')}**\n- **Status:** **${cat.status}** (${cat.usagePercentage}% utilized)\n\n${
          cat.remaining > 0
            ? `You can still spend up to **₹${cat.remaining.toLocaleString('en-IN')}** on ${cat.name} without exceeding your budget.`
            : `You have exhausted this category budget and are currently overspent by **₹${cat.overspentAmount.toLocaleString('en-IN')}**.`
        }`,
        provider: this.name,
      };
    }

    // Question 3: Summary / Overview
    if (
      q.includes('summary') ||
      q.includes('overview') ||
      q.includes('explain my spending') ||
      q.includes('how did i do')
    ) {
      const topCat = [...context.categories].sort((a, b) => b.spent - a.spent)[0];
      const overspentText =
        context.overspentCategories.length > 0
          ? `You have **${context.overspentCategories.length} category exceeding its limit**: ${context.overspentCategories.join(', ')}.`
          : 'All categories remained within allocated budgets.';

      return {
        answer: `### Spending Summary for ${context.month}\n\nDuring **${context.month}**, you allocated a total budget of **₹${context.totalBudget.toLocaleString('en-IN')}** and spent **₹${context.totalSpent.toLocaleString('en-IN')}** (${context.usagePercentage}% used).\n\n- **Largest Category:** **${topCat ? topCat.name : 'N/A'}** was your biggest expense at ₹${topCat ? topCat.spent.toLocaleString('en-IN') : 0}.\n- **Budget Adherence:** ${overspentText}\n- **Remaining Runway:** You currently have **₹${context.remaining.toLocaleString('en-IN')}** remaining for the rest of the month.\n- **Overall Status:** **${context.status}**`,
        provider: this.name,
      };
    }

    // Question 4: "How much money do I have left this month?" / general balance
    if (
      q.includes('left') ||
      q.includes('remaining') ||
      q.includes('how much money do i have') ||
      q.includes('balance')
    ) {
      return {
        answer: `You have **₹${context.remaining.toLocaleString('en-IN')}** remaining out of your total monthly budget of **₹${context.totalBudget.toLocaleString('en-IN')}** (${context.usagePercentage}% utilized).\n\n- **Total Budget:** ₹${context.totalBudget.toLocaleString('en-IN')}\n- **Total Spent:** ₹${context.totalSpent.toLocaleString('en-IN')}\n- **Remaining:** **₹${context.remaining.toLocaleString('en-IN')}**`,
        provider: this.name,
      };
    }

    // Question 5: "Which category is consuming most of my budget?" / "What are my biggest expenses?"
    if (
      q.includes('most') ||
      q.includes('biggest') ||
      q.includes('largest') ||
      q.includes('consuming') ||
      q.includes('highest')
    ) {
      const sorted = [...context.categories].sort((a, b) => b.spent - a.spent);
      const top3 = sorted
        .slice(0, 3)
        .map((c, i) => `${i + 1}. **${c.name}**: ₹${c.spent.toLocaleString('en-IN')} (${c.budget > 0 ? Math.round((c.spent / context.totalSpent) * 100) : 0}% of spending)`)
        .join('\n');

      return {
        answer: `Your largest spending categories this month are:\n\n${top3}\n\nRecent major transactions include:\n${context.topExpenses.slice(0, 3).map((e) => `- ${e.title}: ₹${e.amount.toLocaleString('en-IN')} (${e.category})`).join('\n')}`,
        provider: this.name,
      };
    }

    // Question 6: "Which category should I reduce?" / Recommendations
    if (
      q.includes('reduce') ||
      q.includes('cut') ||
      q.includes('which category should i reduce')
    ) {
      const targets = context.categories.filter((c) => c.status === 'OVER BUDGET' || c.status === 'NEAR LIMIT');
      if (targets.length > 0) {
        const list = targets
          .map(
            (c) =>
              `- **${c.name}**: Spent ₹${c.spent.toLocaleString('en-IN')} against ₹${c.budget.toLocaleString('en-IN')} (${c.status})`
          )
          .join('\n');
        return {
          answer: `To restore your budget buffer, you should prioritize reducing spending in:\n\n${list}\n\nFocusing on discretionary expenses in these categories will help bring your budget health back to optimal levels.`,
          provider: this.name,
        };
      }
      return {
        answer: `Your spending is currently well balanced across all categories! You do not have any urgent reductions required. Continue maintaining your current spending pace to keep ₹${context.remaining.toLocaleString('en-IN')} safely buffered.`,
        provider: this.name,
      };
    }

    // Income & Fixed Commitments Questions (Section 12)
    if (
      q.includes('percentage') && (q.includes('fixed') || q.includes('commitments') || q.includes('income')) ||
      q.includes('fixed expenses')
    ) {
      if (context.financialProfile) {
        const p = context.financialProfile;
        return {
          answer: `Based on your Financial Profile:\n\n- **Monthly Household Income:** ₹${p.monthlyIncome.toLocaleString('en-IN')}\n- **Total Fixed Expenses:** **₹${p.totalFixedExpenses.toLocaleString('en-IN')}**\n- **Fixed Expense Ratio:** **${p.fixedExpenseRatio}%** of your total monthly income is allocated to fixed commitments.\n\n**Breakdown:**\n- Rent: ₹${p.monthlyRent.toLocaleString('en-IN')}\n- EMI / Loans: ₹${p.monthlyEmi.toLocaleString('en-IN')}\n- Utilities: ₹${p.monthlyUtilities.toLocaleString('en-IN')}\n- Insurance: ₹${p.monthlyInsurance.toLocaleString('en-IN')}\n- Other Fixed: ₹${p.otherFixedExpenses.toLocaleString('en-IN')}\n\n*Rule of thumb: Keeping fixed commitments under 50% ensures strong financial resilience.*`,
          provider: this.name,
        };
      } else {
        return {
          answer: 'You have not configured your Financial Profile yet. Please visit the **Financial Profile** tab to set up your monthly income and fixed expenses.',
          provider: this.name,
        };
      }
    }

    // Available Variable Spending Questions (Section 12)
    if (
      q.includes('variable spending') ||
      (q.includes('how much of my income') && q.includes('spend')) ||
      q.includes('available spending')
    ) {
      if (context.financialProfile) {
        const p = context.financialProfile;
        return {
          answer: `Here is your spending power breakdown:\n\n- **Monthly Income:** ₹${p.monthlyIncome.toLocaleString('en-IN')}\n- **Fixed Commitments:** -₹${p.totalFixedExpenses.toLocaleString('en-IN')}\n- **Monthly Savings Goal:** -₹${p.monthlySavingsGoal.toLocaleString('en-IN')}\n----------------------------------\n- **Available Variable Spending:** **₹${p.availableSpending.toLocaleString('en-IN')}** (${p.variableSpendingRatio}% of your income)\n\n${p.budgetFitMessage}`,
          provider: this.name,
        };
      } else {
        return {
          answer: `Based on your configured monthly budget, you have **₹${context.remaining.toLocaleString('en-IN')}** remaining from your total category allocations of ₹${context.totalBudget.toLocaleString('en-IN')}. Configure your **Financial Profile** to see income-level variable spending limits!`,
          provider: this.name,
        };
      }
    }

    // Household & Dependents Questions (Section 12)
    if (
      q.includes('household') ||
      q.includes('earning member') ||
      q.includes('dependents') ||
      (q.includes('family') && q.includes('size'))
    ) {
      if (context.financialProfile) {
        const p = context.financialProfile;
        return {
          answer: `### Household Financial Context\n\n- **Total Household Members:** **${p.householdMembers}**\n- **Earning Members:** **${p.earningMembers}**\n- **Dependents:** **${p.dependents}** (${p.children} children, ${p.adults} adults, ${p.seniors} seniors)\n\n**Assessment:**\nWith **${p.earningMembers} earning members** contributing to a household of **${p.householdMembers}**, your available variable spending of **₹${p.availableSpending.toLocaleString('en-IN')}** translates to approximately **₹${Math.round(p.availableSpending / p.householdMembers).toLocaleString('en-IN')} per member** per month for discretionary and consumable needs (Food, Education, Healthcare). Your current planned category budget of ₹${p.totalCategoryBudgets.toLocaleString('en-IN')} is well-proportioned for your household scale.`,
          provider: this.name,
        };
      }
    }

    // Savings Goal Questions (Section 12)
    if (
      q.includes('savings goal') ||
      q.includes('increase my savings') ||
      (q.includes('save') && q.includes('affect'))
    ) {
      if (context.financialProfile) {
        const p = context.financialProfile;
        const increaseMatch = q.match(/(\d+(?:,\d+)*)/);
        const increase = increaseMatch ? parseFloat(increaseMatch[1].replace(/,/g, '')) : 2000;
        const newSavings = p.monthlySavingsGoal + increase;
        const newAvailable = Math.max(0, p.availableSpending - increase);

        return {
          answer: `### Savings Goal Analysis\n\n- **Current Savings Goal:** ₹${p.monthlySavingsGoal.toLocaleString('en-IN')} (${p.savingsRatio}% of income)\n- **Current Available Spending:** ₹${p.availableSpending.toLocaleString('en-IN')}\n\nIf you increase your monthly savings goal by **₹${increase.toLocaleString('en-IN')}**:\n- **New Savings Goal:** **₹${newSavings.toLocaleString('en-IN')}** (${Math.round((newSavings / p.monthlyIncome) * 100)}% of income)\n- **New Available Spending:** **₹${newAvailable.toLocaleString('en-IN')}**\n\n${
            newAvailable >= p.totalCategoryBudgets
              ? `✓ You can easily afford this! Your planned category budgets (₹${p.totalCategoryBudgets.toLocaleString('en-IN')}) will still fit within the adjusted available spending with ₹${(newAvailable - p.totalCategoryBudgets).toLocaleString('en-IN')} buffer.`
              : `⚠ Notice: If you increase savings by ₹${increase.toLocaleString('en-IN')}, your planned category budgets (₹${p.totalCategoryBudgets.toLocaleString('en-IN')}) will exceed available spending by ₹${(p.totalCategoryBudgets - newAvailable).toLocaleString('en-IN')}. You would need to trim discretionary categories slightly.`
          }`,
          provider: this.name,
        };
      }
    }

    // Affordability Check with Shopping or other categories (Section 12)
    if (
      q.includes('can i afford') ||
      q.includes('can i spend') ||
      q.includes('shopping')
    ) {
      const amountMatch = q.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/);
      const testAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 3000;

      const shopCat = context.categories.find((c) => c.name.toLowerCase() === 'shopping');
      const available = context.financialProfile ? context.financialProfile.availableSpending : context.remaining;

      if (q.includes('shopping')) {
        const currentShopBudget = shopCat ? shopCat.budget : 4000;
        const currentShopSpent = shopCat ? shopCat.spent : 0;
        const currentShopRemaining = shopCat ? shopCat.remaining : currentShopBudget;

        return {
          answer: `### Shopping Affordability Assessment\n\n- **Requested Expense:** **₹${testAmount.toLocaleString('en-IN')}**\n- **Current Shopping Budget:** ₹${currentShopBudget.toLocaleString('en-IN')}\n- **Current Shopping Spent:** ₹${currentShopSpent.toLocaleString('en-IN')}\n- **Remaining Shopping Buffer:** ₹${currentShopRemaining.toLocaleString('en-IN')}\n- **Total Available Variable Spending:** ₹${available.toLocaleString('en-IN')}\n\n**Verdict:**\n${
            testAmount <= currentShopRemaining
              ? `✓ **Yes, you can comfortably afford this!** You have ₹${currentShopRemaining.toLocaleString('en-IN')} remaining in your Shopping budget. After spending ₹${testAmount.toLocaleString('en-IN')}, you will still have ₹${(currentShopRemaining - testAmount).toLocaleString('en-IN')} left.`
              : `⚠ Spending ₹${testAmount.toLocaleString('en-IN')} will exceed your dedicated Shopping buffer by ₹${(testAmount - currentShopRemaining).toLocaleString('en-IN')}. However, your household has ₹${available.toLocaleString('en-IN')} total variable spending capacity without compromising your monthly savings goal.`
          }`,
          provider: this.name,
        };
      }

      return {
        answer: `You have **₹${available.toLocaleString('en-IN')}** available for variable spending this month without compromising your fixed commitments or savings goals. Spending **₹${testAmount.toLocaleString('en-IN')}** would leave a healthy buffer of **₹${Math.max(0, available - testAmount).toLocaleString('en-IN')}**.`,
        provider: this.name,
      };
    }

    // Budget Suggestion Questions (Section 12)
    if (
      q.includes('suggest a budget') ||
      q.includes('suggest budget') ||
      q.includes('recommended budget')
    ) {
      if (context.financialProfile) {
        const p = context.financialProfile;
        return {
          answer: `### Suggested Category Budget Allocations\n\nBased on your monthly household income of **₹${p.monthlyIncome.toLocaleString('en-IN')}**, fixed commitments of **₹${p.totalFixedExpenses.toLocaleString('en-IN')}**, and savings goal of **₹${p.monthlySavingsGoal.toLocaleString('en-IN')}**, you have **₹${p.availableSpending.toLocaleString('en-IN')}** available for variable spending.\n\n**Tailored for a household of ${p.householdMembers} (${p.dependents} dependents):**\n- **Food:** ₹8,000 (35% - Grocery, fresh produce, household pantry)\n- **Travel:** ₹4,000 (18% - Fuel, public transit, commute)\n- **Education:** ₹3,000 (13% - Enrichment & skills)\n- **Shopping:** ₹3,000 (13% - Essential apparel and home supplies)\n- **Entertainment:** ₹2,000 (9% - Family outings and weekend leisure)\n- **Other:** ₹2,000 (9% - Miscellaneous incidentals)\n----------------------------------------\n- **Suggested Planned Total:** **₹22,000**\n- **Discretionary Safety Buffer:** **₹4,000**\n\n*You can review and apply this suggested plan directly from the **Monthly Budgets** or **Financial Profile** pages.*`,
          provider: this.name,
        };
      }
    }

    // Default Context-Aware Answer
    return {
      answer: `Hello! I am **BudgetAI**, your context-aware financial assistant. Here is your current snapshot for **${context.month}**:\n\n- **Total Budget:** ₹${context.totalBudget.toLocaleString('en-IN')}\n- **Total Spent:** ₹${context.totalSpent.toLocaleString('en-IN')}\n- **Remaining Balance:** ₹${context.remaining.toLocaleString('en-IN')} (${context.usagePercentage}% utilized)\n- **Active Status:** **${context.status}**\n\nYou can ask me specific questions such as:\n- *"Where am I overspending?"*\n- *"How much can I still spend on food?"*\n- *"What happens if I spend ₹2,000 on travel?"* (What-If Simulation)\n- *"Give me a summary of my spending this month."*`,
      provider: this.name,
    };
  }
}
export default LocalAIProvider;
