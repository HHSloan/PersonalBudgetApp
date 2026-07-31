import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Target,
  PiggyBank,
  Database,
  Plus,
  Moon,
  Sun,
  Github,
  Gem,
  Globe
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import BudgetPlanner from './components/BudgetPlanner';
import SavingsGoals from './components/SavingsGoals';
import DataManagement from './components/DataManagement';
import AddTransactionModal from './components/AddTransactionModal';
import GitHubGuideModal from './components/GitHubGuideModal';

import { DEFAULT_TRANSACTIONS, DEFAULT_BUDGET_LIMITS, DEFAULT_SAVINGS_GOALS } from './utils/initialData';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('personal_budget_theme') || 'dark');

  // Core Data States with LocalStorage Persistence
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('personal_budget_transactions');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [budgetLimits, setBudgetLimits] = useState(() => {
    const saved = localStorage.getItem('personal_budget_limits');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGET_LIMITS;
  });

  const [savingsGoals, setSavingsGoals] = useState(() => {
    const saved = localStorage.getItem('personal_budget_goals');
    return saved ? JSON.parse(saved) : DEFAULT_SAVINGS_GOALS;
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);

  // Sync Theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('personal_budget_theme', theme);
  }, [theme]);

  // Sync Data to LocalStorage
  useEffect(() => {
    localStorage.setItem('personal_budget_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('personal_budget_limits', JSON.stringify(budgetLimits));
  }, [budgetLimits]);

  useEffect(() => {
    localStorage.setItem('personal_budget_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  // Transaction Handlers
  const handleSaveTransaction = (transactionData) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === transactionData.id ? transactionData : t));
      setEditingTransaction(null);
    } else {
      setTransactions(prev => [transactionData, ...prev]);
    }
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsAddModalOpen(true);
  };

  // Data Import / Reset Handlers
  const handleImportData = (data) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.budgetLimits) setBudgetLimits(data.budgetLimits);
    if (data.savingsGoals) setSavingsGoals(data.savingsGoals);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all transactions, budget limits, and savings goals to sample data?')) {
      setTransactions(DEFAULT_TRANSACTIONS);
      setBudgetLimits(DEFAULT_BUDGET_LIMITS);
      setSavingsGoals(DEFAULT_SAVINGS_GOALS);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Gem size={26} />
          </div>
          <div>
            <h1 className="brand-title">Personal Budget App</h1>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Smart Personal Wealth & Cash Flow</div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setIsGithubModalOpen(true)}
            style={{ gap: '6px', fontSize: '13px' }}
          >
            <Github size={16} /> GitHub & Deploy Guide
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Entry
          </button>

          <button
            className="btn-icon"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={16} /> Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <Receipt size={16} /> Transactions ({transactions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          <Target size={16} /> Budget Planner
        </button>
        <button
          className={`tab-btn ${activeTab === 'savings' ? 'active' : ''}`}
          onClick={() => setActiveTab('savings')}
        >
          <PiggyBank size={16} /> Savings Goals
        </button>
        <button
          className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <Database size={16} /> Data & Export
        </button>
      </nav>

      {/* Tab Content */}
      <main>
        {activeTab === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            budgetLimits={budgetLimits}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeTab === 'transactions' && (
          <Transactions
            transactions={transactions}
            onDelete={handleDeleteTransaction}
            onEdit={handleEditTransaction}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetPlanner
            budgetLimits={budgetLimits}
            transactions={transactions}
            onUpdateLimits={setBudgetLimits}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsGoals
            savingsGoals={savingsGoals}
            onUpdateGoals={setSavingsGoals}
          />
        )}

        {activeTab === 'data' && (
          <DataManagement
            transactions={transactions}
            budgetLimits={budgetLimits}
            savingsGoals={savingsGoals}
            onImportData={handleImportData}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      {/* GitHub & Deploy Modal */}
      <GitHubGuideModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
      />
    </div>
  );
}
