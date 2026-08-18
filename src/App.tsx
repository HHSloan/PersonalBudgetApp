import React, { useState, useEffect } from 'react';
import {
  Transaction,
  BudgetLimit,
  ActiveTab,
  ThemeMode,
  Category,
} from './types/budget';
import {
  loadTransactions,
  saveTransactions,
  loadBudgetLimits,
  saveBudgetLimits,
  loadTheme,
  saveTheme,
  resetToDefaultData,
} from './utils/storage';

import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { StatementUploadModal } from './components/StatementUploadModal';
import { BudgetManager } from './components/BudgetManager';
import { AnalyticsView } from './components/AnalyticsView';

export const App: React.FC = () => {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>(() => loadBudgetLimits());
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'danger' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Sync Theme to HTML Root Element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    saveTheme(theme);
  }, [theme]);

  // Sync Transactions to LocalStorage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Sync Budget Limits to LocalStorage
  useEffect(() => {
    saveBudgetLimits(budgetLimits);
  }, [budgetLimits]);

  // Toggle Theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Save Transaction (Add or Edit)
  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'> & { id?: string }) => {
    if (transactionData.id) {
      // Edit mode
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionData.id ? (transactionData as Transaction) : t))
      );
      showToast('Transaction updated successfully', 'success');
    } else {
      // Create mode
      const newTx: Transaction = {
        ...transactionData,
        id: `tx-${Date.now()}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast('New transaction added', 'success');
    }
    setEditingTransaction(null);
  };

  // Bulk Import Statement Handler
  const handleBulkImportStatement = (importedItems: Omit<Transaction, 'id'>[]) => {
    const newItems: Transaction[] = importedItems.map((item, idx) => ({
      ...item,
      id: `tx-statement-${Date.now()}-${idx}`,
    }));
    setTransactions((prev) => [...newItems, ...prev]);
    showToast(`Successfully imported ${newItems.length} transactions from statement`, 'success');
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction deleted', 'info');
  };

  // Update Budget Limit
  const handleUpdateBudgetLimit = (category: Category, newLimit: number) => {
    setBudgetLimits((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit: newLimit } : b))
    );
    showToast(`Budget limit for ${category} updated to $${newLimit}`, 'success');
  };

  // Reset Data to Defaults
  const handleResetData = () => {
    const { transactions: defaultTx, budgetLimits: defaultLimits } = resetToDefaultData();
    setTransactions(defaultTx);
    setBudgetLimits(defaultLimits);
    showToast('Data reset to demo defaults', 'info');
  };

  // Import JSON Backup
  const handleImportData = (data: { transactions: Transaction[]; budgetLimits: BudgetLimit[] }) => {
    setTransactions(data.transactions);
    setBudgetLimits(data.budgetLimits);
    showToast('Backup data restored successfully', 'success');
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
    showToast(`Category for "${updatedTx.title}" updated to ${updatedTx.category}`, 'success');
  };

  // Add New Category
  const handleAddCategory = (categoryName: string, initialLimit: number) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;

    if (budgetLimits.some((b) => b.category.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`Category "${trimmed}" already exists`, 'danger');
      return;
    }

    setBudgetLimits((prev) => [...prev, { category: trimmed, limit: initialLimit }]);
    showToast(`Added new category "${trimmed}" with $${initialLimit} budget limit`, 'success');
  };

  // Delete Category
  const handleDeleteCategory = (categoryName: string) => {
    setBudgetLimits((prev) => prev.filter((b) => b.category !== categoryName));
    setTransactions((prev) =>
      prev.map((t) => (t.category === categoryName ? { ...t, category: '' } : t))
    );
    showToast(`Category "${categoryName}" deleted. Associated transactions set to Unassigned.`, 'info');
  };

  // Count categories over budget
  const expenseByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const overBudgetCount = budgetLimits.filter(
    (b) => (expenseByCategory[b.category] || 0) > b.limit
  ).length;

  const fullCategoriesList = Array.from(
    new Set([
      ...budgetLimits.map((b) => b.category),
      ...transactions.map((t) => t.category),
    ])
  ).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsModalOpen(true);
        }}
        onOpenUploadModal={() => {
          setIsUploadModalOpen(true);
        }}
        overBudgetCount={overBudgetCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {activeTab === 'dashboard' && (
          <DashboardOverview
            transactions={transactions}
            budgetLimits={budgetLimits}
            onNavigateToTransactions={() => setActiveTab('transactions')}
            onNavigateToBudgets={() => setActiveTab('budgets')}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            availableCategories={fullCategoriesList}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            onOpenUploadModal={() => {
              setIsUploadModalOpen(true);
            }}
            onOpenEditModal={(tx) => {
              setEditingTransaction(tx);
              setIsModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateTransaction={handleUpdateTransaction}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetManager
            transactions={transactions}
            budgetLimits={budgetLimits}
            onUpdateLimit={handleUpdateBudgetLimit}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            transactions={transactions}
            budgetLimits={budgetLimits}
            onResetData={handleResetData}
            onImportData={handleImportData}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} PersonalBudgetApp. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with React, Vite, Tailwind CSS & Recharts</span>
          </p>
        </div>
      </footer>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        availableCategories={fullCategoriesList}
      />

      {/* Statement Upload Modal */}
      <StatementUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onBulkImport={handleBulkImportStatement}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounceIn">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-bold border flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-500/90 text-slate-950 border-emerald-400'
                : toast.type === 'danger'
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                : 'bg-slate-800/90 text-slate-100 border-slate-700'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};
