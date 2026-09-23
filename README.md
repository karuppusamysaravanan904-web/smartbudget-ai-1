# SMARTBUDGET AI — AI-Powered Personal Budget Planner

> **"Plan Better. Spend Smarter. Ask Your Budget."**  
> *Don't just track where your money went. Ask your budget what to do next.*

---

## 🏆 Project Overview & PS49 Solution

**SmartBudget AI** is a complete, full-stack, responsive web application engineered for **PS49 – Personal Budget Planner**. It satisfies all official requirements for setting monthly limits, recording expense entries, calculating remaining buffers, identifying overspending categories, and visualizing metrics, while introducing an **AI Financial Guidance Layer** that transforms traditional reactive accounting into an active, context-aware decision assistant.

Unlike generic chatbot wrappers, SmartBudget AI is **Context-Aware, Budget-Aware, and Data-Aware**. The assistant connects directly to the authenticated user's live database snapshot to answer specific questions, explain calculations, identify overspending risks, and run **What-If financial simulations** before a single rupee is spent.

---

## 🌟 Key Innovations (The Differentiating Layer)

### 1. BudgetAI Doubt Assistant
- Embedded dashboard interface + floating assistant drawer (`💬 Ask BudgetAI`).
- Answers questions using the authenticated user's real database context:
  - *"Where am I overspending?"* -> Directly identifies overspent categories with exact amounts.
  - *"How much can I still spend on food?"* -> Calculates current Food budget minus expenses live.
  - *"Can I afford a ₹1,000 dinner tonight?"* -> Computes impact on remaining category buffer.
  - *"Give me a summary of my spending this month."* -> Synthesizes an executive overview.
- Multi-session chat history, typing indicators, quick prompt chips, and instant conversation resets.

### 2. What-If Financial Decision Simulator
- Interactive simulation sandbox where users can test hypothetical expenses (e.g., *"What if I spend ₹2,000 on Travel?"*).
- Calculates projected spending, remaining runway, utilization %, and overspending risk side-by-side.
- **Strict Sandbox Isolation**: Clearly labeled `SIMULATION — NOT SAVED`. Never modifies real financial records.

### 3. Transparent Budget Health Score (0–100%)
- **No Black-Box AI Scores**: Transparent mathematical indicator based on clear financial discipline factors:
  - Budget utilization percentage
  - Number of categories exceeding limits
  - Number of categories approaching warning limits (≥80%)
  - Unallocated runway ratio
- Complete "Why?" factor breakdown checklist with visual badges and guidance.

### 4. AI Smart Insights
- Dynamic, real-time cards generated from actual database records:
  - **Overspending Alert**: *"You have exceeded your Travel budget by ₹1,200."*
  - **Spending Pattern**: *"Food accounts for 33.5% of your total spending this month."*
  - **Near Limit Warning**: *"You have used 90% of your Entertainment budget. Only ₹300 remaining."*
  - **Positive Reinforcement**: *"You are comfortably within budget for Education with ₹3,000 remaining."*

### 5. Smart Budget Recommendations
- Evaluates spending patterns vs allocated limits and suggests realistic adjustments (e.g. aligning budget limits with recurring overspending or freeing up idle surplus) requiring explicit one-click user approval.

### 6. Income & Household Financial Profile Engine (NEW)
- Establishes a true financial foundation before setting discretionary category budgets:
  - **Fixed Commitments**: $\text{Rent} + \text{EMI} + \text{Utilities} + \text{Insurance} + \text{Other}$
  - **Available Variable Spending**: $\text{Monthly Income} - \text{Total Fixed Expenses} - \text{Monthly Savings Goal}$
  - **Budget Fit Assessment**: Verifies $\text{Available Spending} \ge \text{Total Category Budgets}$, flagging over-allocation buffers.
  - **Household Scale Context**: Accounts for total members, earning members, and dependents to evaluate living cost realism.
  - **AI Budget Structuring**: Generates recommended category allocations calibrated directly to available variable spending.

---

## 🎯 Hackathon Demo Scenario (Step 31 & 32 Ready)

The application comes pre-seeded with the exact **September 2026** demonstration dataset requested by the hackathon judges:

### Seed Data Snapshot (September 2026):
| Category | Allocated Budget | Actual Spent | Remaining Balance | Status | Utilization |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Food** | ₹8,000 | ₹6,500 | ₹1,500 | `NEAR LIMIT` | 81.3% |
| **Travel** | ₹5,000 | ₹6,200 | -₹1,200 | `OVER BUDGET` | 124.0% |
| **Education** | ₹7,000 | ₹4,000 | ₹3,000 | `UNDER BUDGET` | 57.1% |
| **Entertainment**| ₹3,000 | ₹2,700 | ₹300 | `NEAR LIMIT` | 90.0% |
| **TOTAL** | **₹23,000** | **₹19,400** | **₹3,600** | `NEAR LIMIT` | **84.3%** |

### Financial Profile Baseline (Alex Rivera):
| Metric | Amount / Value | Notes |
| :--- | :---: | :--- |
| **Monthly Income** | **₹60,000** | Gross monthly household inflow |
| **Fixed Commitments** | **₹24,000** | Rent (₹12k), EMI (₹5k), Utilities (₹3k), Insurance (₹2k), Other (₹2k) — 40.0% of income |
| **Monthly Savings Target** | **₹10,000** | Non-negotiable target (16.7% of income) |
| **Available Variable Spending** | **₹26,000** | Safe discretionary spending envelope ($\text{Income} - \text{Fixed} - \text{Savings}$) |
| **Category Budgets Total** | **₹23,000** | Food (₹8k), Travel (₹5k), Education (₹7k), Entertainment (₹3k) |
| **Budget Fit Assessment** | **FIT (PASS)** | ₹23,000 $\le$ ₹26,000 — **₹3,000 Safety Buffer remaining** |
| **Household Composition** | **4 Members** | 2 Earning Adults, 2 Dependent Children |

### 6-Step Verification Walkthrough for Judges:
1. **Inspect Dashboard**: Log in with demo account (`demo@smartbudget.ai` / `password123` or click **Fast Demo Login**). Verify Total Budget is **₹23,000**, Total Spent is **₹19,400**, Remaining is **₹3,600**. Notice the **Financial Overview** card reflecting Monthly Inflow (₹60,000), Fixed Commitments (₹24,000), Savings Goal (₹10,000), and Available Spending (₹26,000).
2. **Inspect Financial Profile**: Click **Financial Profile** in the sidebar. Review the interactive breakdown cards, fixed obligation list, household stats, and the AI Suggested Category Allocations.
3. **Ask BudgetAI**: Click quick prompt *"Where am I overspending?"* -> AI inspects actual data and identifies Travel exceeded by ₹1,200.
4. **Ask Profile Questions**: Ask *"What percentage of my income is going toward fixed expenses?"* -> AI identifies 40% (₹24,000 / ₹60,000). Ask *"Is my current budget reasonable for my household size?"* -> AI references 4 members, 2 earning, 2 dependents with ₹6,500/member variable allocation.
5. **Run Simulation**: Ask *"What happens if I spend ₹2,000 on travel?"* -> AI calculates projected Travel spending rising to ₹8,200, and reports available variable spending reducing from ₹26,000 to ₹21,000. Marked as `[SIMULATION — NOT SAVED]`.
6. **Edit Travel Budget**: Navigate to **Monthly Budgets**, change Travel budget from **₹5,000 to ₹8,000**. Dashboard recalculates live. Ask BudgetAI again: *"Am I still over budget on travel?"* -> AI uses the updated database values and confirms Travel is now within budget with ₹1,800 remaining!

---

## 🔌 Financial Profile API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/profile/financial` | Returns the user's financial profile with full computed metrics (total fixed expenses, available spending, ratios, budget fit assessment) |
| `POST` | `/api/profile/financial` | Upserts the user's financial profile with strict Zod validation (positive numbers, household $\ge$ earning) |
| `DELETE` | `/api/profile/financial` | Deletes the profile to allow testing the onboarding banner state |
| `GET` | `/api/profile/financial/suggested-budget` | Returns an AI-structured recommended budget allocating available variable spending safely |

---

## 🏛️ System Architecture

```
                  ┌────────────────────────────────────────┐
                  │       React 18 + Vite Frontend         │
                  │   Glassmorphic UI | Recharts Visuals   │
                  │   Interactive What-If | BudgetAI Chat  │
                  └───────────────────┬────────────────────┘
                                      │ REST API + JWT
                                      ▼
                  ┌────────────────────────────────────────┐
                  │         Express.js Backend API         │
                  │   Auth | Budgets | Expenses | Reports  │
                  └─────────┬───────────────────┬──────────┘
                            │                   │
                            ▼                   ▼
                  ┌──────────────────┐  ┌───────────────────────────────┐
                  │    Prisma ORM    │  │       AI Service Layer        │
                  │  (SQLite/PgSQL)  │  │ Intent Detection + Safe Ctx   │
                  └──────────────────┘  └───────────────┬───────────────┘
                                                        │
                                                        ▼
                                        ┌───────────────────────────────┐
                                        │  Modular AI Providers:        │
                                        │  - Google Gemini              │
                                        │  - OpenAI                     │
                                        │  - Smart Local Fallback Engine│
                                        └───────────────────────────────┘
```

---

## 💻 Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Recharts, Lucide Icons, Custom Vanilla CSS Design System with HSL tokens, glassmorphism, and responsive breakpoints.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT, bcryptjs, Zod.
- **Database**: SQLite out-of-the-box (zero configuration needed), fully swappable to PostgreSQL via `DATABASE_URL`.
- **AI Layer**: Context builder + modular AI provider interface supporting Google Gemini, OpenAI, and a built-in deterministic local intelligence engine for 100% offline reliability.

---

## 📂 Project Structure

```
f:\Big Hack\
├── package.json               # Root monorepo orchestration
├── README.md                  # Comprehensive project documentation
├── server\
│   ├── prisma\
│   │   ├── schema.prisma      # Models: User, Category, Budget, Expense, Settings, AIConversation, AIMessage
│   │   └── seed.ts            # Database seed entrypoint
│   ├── src\
│   │   ├── config\            # Prisma singleton
│   │   ├── controllers\       # Auth, Budget, Expense, Category, Simulator, Reports, AI controllers
│   │   ├── middleware\        # JWT auth & error handling
│   │   ├── routes\            # API route definitions
│   │   ├── services\          # Business logic, calculations, health score, insights, simulator
│   │   │   └── ai\            # AI provider interface, Gemini, OpenAI, Local provider, AI service
│   │   ├── test-demo-flow.ts  # Automated Step 31/32 verification test suite
│   │   └── index.ts           # Express server entrypoint
│   ├── package.json
│   └── tsconfig.json
└── client\
    ├── index.html             # SEO meta tags, Google Fonts
    ├── vite.config.ts         # Vite server & API proxy
    ├── src\
    │   ├── api\               # Typed API client
    │   ├── context\           # AuthContext, BudgetContext
    │   ├── components\        # Navbar, Sidebar, AiChatDrawer, HealthScoreCard, InsightsCard, Modals
    │   ├── pages\             # Landing, Dashboard, Budgets, Expenses, Simulator, Reports, Innovation, Auth
    │   ├── styles\            # Modern CSS tokens & glassmorphism system
    │   ├── App.tsx            # Main application shell
    │   └── main.tsx
    ├── package.json
    └── tsconfig.json
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+ or v20+ or v24+)
- npm (v9+)

### 1. Installation
Install all dependencies across the workspace:
```bash
npm run install:all
```
*(On Windows PowerShell, use `npm.cmd run install:all`)*

### 2. Database Setup & Seeding
Initialize the database and seed the September 2026 hackathon demo data:
```bash
cd server
npx prisma db push
npx tsx prisma/seed.ts
cd ..
```

### 3. Running the Application
Start both the backend API server and frontend client concurrently:
```bash
npm run dev
```
*(Or in separate terminal windows: `cd server && npm run dev` and `cd client && npm run dev`)*

- **Frontend Client**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

### 4. Running the Automated Step 31 & 32 Verification Test
Run the automated verification script:
```bash
cd server
npx tsx src/test-demo-flow.ts
```

---

## 🔐 Credentials & Environment Variables

### Demo User Credentials:
- **Email**: `demo@smartbudget.ai`
- **Password**: `password123`
*(Or simply click **Fast Demo Login** on the login page)*

### Server Environment (`server/.env`):
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="smartbudget_super_secret_jwt_key_2026"
AI_PROVIDER="local" # Options: "gemini", "openai", "local"
AI_API_KEY=""       # Optional: Google Gemini or OpenAI API Key
AI_MODEL="gemini-1.5-flash"
```

> **Note on AI Offline Reliability**: If no external API key is provided, SmartBudget AI automatically activates its built-in deterministic local intelligence provider. The application will never crash or fail due to network drops or rate limits during judging.

---

## ⚖️ Financial Safety & Boundaries

SmartBudget AI is an educational budgeting and spending analysis tool.
- It does **not** provide investment recommendations, stock advice, gambling tips, or guaranteed returns.
- Hypothetical queries are always quarantined inside the What-If Simulator and clearly marked `SIMULATION — NOT SAVED`.
- Multi-tenant isolation guarantees that each user's financial records are strictly isolated and never leaked to other users or external models.
