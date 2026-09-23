import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BudgetProvider } from './context/BudgetContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AiChatDrawer from './components/AiChatDrawer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FinancialProfilePage from './pages/FinancialProfilePage';
import BudgetsPage from './pages/BudgetsPage';
import ExpensesPage from './pages/ExpensesPage';
import SimulatorPage from './pages/SimulatorPage';
import ReportsPage from './pages/ReportsPage';
import InnovationPage from './pages/InnovationPage';
import { Bot } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiInitialQuestion, setAiInitialQuestion] = useState<string | null>(null);

  const handleOpenAiChat = (prompt?: string) => {
    if (prompt) {
      setAiInitialQuestion(prompt);
    }
    setIsAiChatOpen(true);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: 'var(--text-muted)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1.5s infinite',
          }}
        >
          <Bot size={28} color="#ffffff" />
        </div>
        <p style={{ fontWeight: 600 }}>Loading SmartBudget AI...</p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (authView === 'login') {
      return (
        <LoginPage
          onSuccess={() => setAuthView('landing')}
          onGoToRegister={() => setAuthView('register')}
          onBackToLanding={() => setAuthView('landing')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <RegisterPage
          onSuccess={() => setAuthView('landing')}
          onGoToLogin={() => setAuthView('login')}
          onBackToLanding={() => setAuthView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onGoToApp={() => setAuthView('landing')}
        onGoToAuth={(mode) => setAuthView(mode)}
      />
    );
  }

  // Authenticated App Shell
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Personal Budget Dashboard';
      case 'profile':
        return 'Income & Household Profile';
      case 'budgets':
        return 'Monthly Category Budgets';
      case 'expenses':
        return 'Expense Transactions';
      case 'simulator':
        return 'What-If Financial Simulator';
      case 'reports':
        return 'Reports & Statements';
      case 'innovation':
        return 'Why SmartBudget AI?';
      default:
        return 'Personal Budget Planner';
    }
  };

  return (
    <BudgetProvider>
      <div className="app-container">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenAiChat={() => handleOpenAiChat()}
        />

        <div className="main-content">
          <Navbar
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onOpenAiChat={() => handleOpenAiChat()}
            pageTitle={getTabTitle()}
          />

          <main className="page-body">
            {currentTab === 'dashboard' && (
              <DashboardPage
                onOpenAiChat={handleOpenAiChat}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}
            {currentTab === 'profile' && <FinancialProfilePage />}
            {currentTab === 'budgets' && <BudgetsPage />}
            {currentTab === 'expenses' && <ExpensesPage />}
            {currentTab === 'simulator' && <SimulatorPage />}
            {currentTab === 'reports' && <ReportsPage />}
            {currentTab === 'innovation' && <InnovationPage />}
          </main>

          {/* Floating AI Assistant Action Button (Requirement 7) */}
          <button
            onClick={() => handleOpenAiChat()}
            className="floating-ai-btn"
            aria-label="Ask BudgetAI Assistant"
          >
            <Bot size={20} />
            <span>💬 Ask BudgetAI</span>
          </button>

          {/* Assistant Drawer */}
          <AiChatDrawer
            isOpen={isAiChatOpen}
            onClose={() => setIsAiChatOpen(false)}
            initialQuestion={aiInitialQuestion}
            onClearInitialQuestion={() => setAiInitialQuestion(null)}
          />
        </div>
      </div>
    </BudgetProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
