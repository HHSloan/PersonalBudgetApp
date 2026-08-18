import React, { useState } from 'react';
import { Transaction, BudgetLimit, Category } from '../types/budget';
import { formatCurrency, getCategoryColor, CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/formatters';
import { PieChart, Edit3, Save, Check, AlertTriangle, ShieldCheck, PlusCircle, Trash2, X, FolderPlus, Search, Filter } from 'lucide-react';

interface BudgetManagerProps {
  transactions: Transaction[];
  budgetLimits: BudgetLimit[];
  onUpdateLimit: (category: Category, newLimit: number) => void;
  onAddCategory?: (categoryName: string, initialLimit: number) => void;
  onDeleteCategory?: (categoryName: string) => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  transactions,
  budgetLimits,
  onUpdateLimit,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');
  
  // Add Category form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatLimit, setNewCatLimit] = useState('300');
  const [addError, setAddError] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'expense' | 'income' | 'over-budget'>('all');

  // Delete Category confirmation state
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<Category | null>(null);

  // Calculate actual spending per category for current expenses
  const spendingByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Gather ALL categories from master CATEGORIES, budgetLimits, and current transactions
  const allMasterCategories = Array.from(
    new Set([
      ...CATEGORIES,
      ...budgetLimits.map((b) => b.category),
      ...transactions.map((t) => t.category),
    ])
  ).filter(Boolean);

  // Filter Categories for Display
  const displayCategories = allMasterCategories.filter((cat) => {
    // Search query match
    const matchesSearch = cat.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab match
    const isIncome = INCOME_CATEGORIES.includes(cat);
    const limitObj = budgetLimits.find((b) => b.category === cat);
    const limit = limitObj ? limitObj.limit : 0;
    const spent = spendingByCategory[cat] || 0;
    const isOver = spent > limit && limit > 0;

    let matchesTab = true;
    if (filterTab === 'expense') matchesTab = !isIncome;
    if (filterTab === 'income') matchesTab = isIncome;
    if (filterTab === 'over-budget') matchesTab = isOver;

    return matchesSearch && matchesTab;
  });

  // Calculate Total Expense Monthly Budget
  const expenseCategories = allMasterCategories.filter((c) => !INCOME_CATEGORIES.includes(c));

  const totalMonthlyBudget = budgetLimits
    .filter((b) => expenseCategories.includes(b.category))
    .reduce((sum, b) => sum + b.limit, 0);

  const totalMonthlySpent = expenseCategories.reduce(
    (sum, cat) => sum + (spendingByCategory[cat] || 0),
    0
  );

  const overallPercentage = totalMonthlyBudget > 0 ? (totalMonthlySpent / totalMonthlyBudget) * 100 : 0;

  const handleStartEdit = (category: Category, currentLimit: number) => {
    setEditingCategory(category);
    setTempLimit(currentLimit.toString());
  };

  const handleSaveEdit = (category: Category) => {
    const clean = tempLimit.replace(/[^0-9.-]/g, '');
    const val = parseFloat(clean);
    if (!isNaN(val) && val >= 0) {
      onUpdateLimit(category, val);
    }
    setEditingCategory(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setAddError('Category name is required.');
      return;
    }
    const clean = newCatLimit.replace(/[^0-9.-]/g, '');
    const val = parseFloat(clean);
    if (isNaN(val) || val < 0) {
      setAddError('Limit must be a valid positive amount in US dollars (e.g. 300.00 or $300.00).');
      return;
    }

    if (onAddCategory) {
      onAddCategory(newCatName.trim(), val);
    }

    setNewCatName('');
    setNewCatLimit('300');
    setAddError('');
    setIsAddOpen(false);
  };

  const handleDeleteConfirm = (cat: Category) => {
    if (onDeleteCategory) {
      onDeleteCategory(cat);
    }
    setDeleteConfirmCat(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Health Overview Card */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-slate-100">Category Budgets ({allMasterCategories.length} Categories)</h2>
            </div>
            <p className="text-xs text-slate-400">
              Displaying all category tiles, budget spending limits, and utilization progress
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Add Category CTA Button */}
            <button
              onClick={() => {
                setIsAddOpen((prev) => !prev);
                setAddError('');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add Category</span>
            </button>

            {/* Combined Totals */}
            <div className="flex items-center gap-6 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Total Limit</span>
                <p className="text-base font-extrabold text-slate-100">{formatCurrency(totalMonthlyBudget)}</p>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Total Spent</span>
                <p className={`text-base font-extrabold ${totalMonthlySpent > totalMonthlyBudget ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {formatCurrency(totalMonthlySpent)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Overall Expense Budget Utilization</span>
            <span className={overallPercentage > 100 ? 'text-amber-400' : overallPercentage > 85 ? 'text-yellow-400' : 'text-emerald-400'}>
              {overallPercentage.toFixed(1)}% Used
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900/80 overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage > 100
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : overallPercentage > 85
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search category tiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-200 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500/80 transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 w-full sm:w-auto">
          {[
            { id: 'all', label: `All (${allMasterCategories.length})` },
            { id: 'expense', label: 'Expenses' },
            { id: 'income', label: 'Income' },
            { id: 'over-budget', label: 'Over Budget' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Category Drawer / Form */}
      {isAddOpen && (
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-slate-900/90 shadow-2xl animate-fadeIn space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-slate-100">Create New Budget Category</h3>
            </div>
            <button
              onClick={() => setIsAddOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {addError && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              {addError}
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Category Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Vacation Fund, Pets, Lawn Care"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Monthly Budget Limit ($) *
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="$300.00"
                value={newCatLimit}
                onChange={(e) => setNewCatLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-colors"
              >
                Save Category
              </button>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Tiles Grid */}
      {displayCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCategories.map((cat) => {
            const limitObj = budgetLimits.find((b) => b.category === cat) || { category: cat, limit: 0 };
            const spent = spendingByCategory[cat] || 0;
            const remaining = limitObj.limit - spent;
            const percent = limitObj.limit > 0 ? (spent / limitObj.limit) * 100 : 0;
            const isOver = spent > limitObj.limit && limitObj.limit > 0;
            const isWarning = percent >= 75 && !isOver;
            const isIncomeCat = INCOME_CATEGORIES.includes(cat);

            const colorTheme = getCategoryColor(cat);

            return (
              <div
                key={cat}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  isOver
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : isWarning
                    ? 'border-yellow-500/40 bg-yellow-500/5'
                    : 'border-slate-800'
                }`}
              >
                {/* Category Tile Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: colorTheme }}
                    />
                    <h3 className="font-bold text-slate-100 text-sm truncate" title={cat}>{cat}</h3>
                  </div>

                  {/* Edit & Delete Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    
                    {/* Delete Confirmation Row */}
                    {deleteConfirmCat === cat ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteConfirm(cat)}
                          className="px-2 py-1 rounded-md bg-amber-400 text-slate-950 text-[11px] font-extrabold hover:bg-amber-300 transition-colors"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCat(null)}
                          className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] hover:bg-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Edit Limit Control */}
                        {editingCategory === cat ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="$0.00"
                              value={tempLimit}
                              onChange={(e) => setTempLimit(e.target.value)}
                              className="w-24 px-2 py-1 rounded-lg bg-slate-900 border border-emerald-500 text-slate-100 text-xs font-mono focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveEdit(cat)}
                              className="p-1 rounded-md bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(cat, limitObj.limit)}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors p-1 rounded-md hover:bg-slate-800"
                            title="Edit Monthly Limit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="font-mono text-slate-300">
                              {limitObj.limit > 0 ? formatCurrency(limitObj.limit) : 'Set Limit'}
                            </span>
                          </button>
                        )}

                        {/* Delete Category Button */}
                        <button
                          onClick={() => setDeleteConfirmCat(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                  </div>
                </div>

                {/* Numbers Row */}
                <div className="mt-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">{isIncomeCat ? 'Received: ' : 'Spent: '}</span>
                    <span className={`font-bold ${isIncomeCat ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {formatCurrency(spent)}
                    </span>
                  </div>
                  {!isIncomeCat && (
                    <div>
                      <span className="text-slate-400">{isOver ? 'Over budget: ' : 'Remaining: '}</span>
                      <span className={`font-bold ${isOver ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar (For Expenses) */}
                {!isIncomeCat && (
                  <div className="mt-2 space-y-1">
                    <div className="w-full h-2.5 rounded-full bg-slate-900/90 overflow-hidden border border-slate-800/80">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver
                            ? 'bg-amber-400'
                            : isWarning
                            ? 'bg-yellow-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${limitObj.limit > 0 ? Math.min(percent, 100) : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        {limitObj.limit === 0 ? (
                          <span className="text-slate-400 italic">No limit set</span>
                        ) : isOver ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Exceeded limit
                          </span>
                        ) : isWarning ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Approaching limit
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> On Track
                          </span>
                        )}
                      </span>
                      {limitObj.limit > 0 && <span className="font-mono font-medium">{percent.toFixed(0)}%</span>}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4 glass-panel rounded-2xl text-slate-400">
          <p className="text-base font-semibold text-slate-300">No categories found</p>
          <p className="text-xs mt-1">Try clearing your search query or switching filter tabs.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterTab('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-emerald-400 text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

    </div>
  );
};
