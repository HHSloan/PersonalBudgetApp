import React, { useState } from 'react';
import { Transaction, BudgetLimit, Category } from '../types/budget';
import { formatCurrency, CATEGORIES, CATEGORY_COLORS } from '../utils/formatters';
import { PieChart, Edit3, Save, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface BudgetManagerProps {
  transactions: Transaction[];
  budgetLimits: BudgetLimit[];
  onUpdateLimit: (category: Category, newLimit: number) => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  transactions,
  budgetLimits,
  onUpdateLimit,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');

  // Calculate actual spending per category for current expenses
  const spendingByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Filter expense-relevant categories (excluding Income)
  const expenseCategories = CATEGORIES.filter((cat) => cat !== 'Income' && cat !== 'Investments');

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
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val >= 0) {
      onUpdateLimit(category, val);
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Health Overview Card */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-slate-100">Monthly Budget Limits</h2>
            </div>
            <p className="text-xs text-slate-400">
              Track category spending limits and monitor budget usage progress
            </p>
          </div>

          {/* Combined Totals */}
          <div className="flex items-center gap-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Total Limit</span>
              <p className="text-lg font-extrabold text-slate-100">{formatCurrency(totalMonthlyBudget)}</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Total Spent</span>
              <p className={`text-lg font-extrabold ${totalMonthlySpent > totalMonthlyBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatCurrency(totalMonthlySpent)}
              </p>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Overall Budget Utilization</span>
            <span className={overallPercentage > 100 ? 'text-rose-400' : overallPercentage > 85 ? 'text-amber-400' : 'text-emerald-400'}>
              {overallPercentage.toFixed(1)}% Used
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900/80 overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage > 100
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : overallPercentage > 85
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expenseCategories.map((cat) => {
          const limitObj = budgetLimits.find((b) => b.category === cat) || { category: cat, limit: 500 };
          const spent = spendingByCategory[cat] || 0;
          const remaining = limitObj.limit - spent;
          const percent = limitObj.limit > 0 ? (spent / limitObj.limit) * 100 : 0;
          const isOver = spent > limitObj.limit;
          const isWarning = percent >= 75 && !isOver;

          const colorTheme = CATEGORY_COLORS[cat] || '#64748b';

          return (
            <div
              key={cat}
              className={`glass-panel p-5 rounded-2xl border transition-all ${
                isOver
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : isWarning
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-slate-800'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: colorTheme }}
                  />
                  <h3 className="font-bold text-slate-100 text-sm">{cat}</h3>
                </div>

                {/* Edit Limit Control */}
                {editingCategory === cat ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="50"
                      min="0"
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
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="font-mono text-slate-300">{formatCurrency(limitObj.limit)}</span>
                  </button>
                )}
              </div>

              {/* Numbers Row */}
              <div className="mt-4 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Spent: </span>
                  <span className="font-bold text-slate-100">{formatCurrency(spent)}</span>
                </div>
                <div>
                  <span className="text-slate-400">{isOver ? 'Over budget: ' : 'Remaining: '}</span>
                  <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatCurrency(Math.abs(remaining))}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2 space-y-1">
                <div className="w-full h-2.5 rounded-full bg-slate-900/90 overflow-hidden border border-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    {isOver ? (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
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
                  <span className="font-mono font-medium">{percent.toFixed(0)}%</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
