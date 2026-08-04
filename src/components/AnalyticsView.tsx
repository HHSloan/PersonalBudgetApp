import React, { useRef } from 'react';
import { Transaction, BudgetLimit } from '../types/budget';
import { formatCurrency, EXPENSE_CATEGORIES, CATEGORY_COLORS } from '../utils/formatters';
import { BarChart3, Download, Upload, RotateCcw, Award, Percent, Layers } from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  budgetLimits: BudgetLimit[];
  onResetData: () => void;
  onImportData: (data: { transactions: Transaction[]; budgetLimits: BudgetLimit[] }) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  budgetLimits,
  onResetData,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Spending totals per category
  const expenseByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const totalExpense = Object.values(expenseByCategory).reduce((sum, v) => sum + v, 0);

  // Sort expense categories by total spent descending
  const categoryAnalysis = EXPENSE_CATEGORIES
    .map((cat) => {
      const spent = expenseByCategory[cat] || 0;
      const limitObj = budgetLimits.find((b) => b.category === cat);
      const limit = limitObj ? limitObj.limit : 0;
      const share = totalExpense > 0 ? (spent / totalExpense) * 100 : 0;
      return {
        category: cat,
        spent,
        limit,
        variance: limit - spent,
        share,
        color: CATEGORY_COLORS[cat] || '#64748b',
      };
    })
    .sort((a, b) => b.spent - a.spent);

  // Top spending category
  const topCategory = categoryAnalysis[0];

  // Export JSON handler
  const handleExportData = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      transactions,
      budgetLimits,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personalbudgetapp-backup-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.transactions) && Array.isArray(parsed.budgetLimits)) {
          onImportData({
            transactions: parsed.transactions,
            budgetLimits: parsed.budgetLimits,
          });
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Actions */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-extrabold text-slate-100">Financial Insights & Data Tools</h2>
          </div>
          <p className="text-xs text-slate-400">
            Deep dive into spending distributions, category shares, and data backup controls
          </p>
        </div>

        {/* Export / Import / Reset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset data to initial demo defaults?')) {
                onResetData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-colors border border-amber-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Highlights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Top Spender Category</span>
            <p className="text-base font-extrabold text-slate-100 mt-0.5">
              {topCategory && topCategory.spent > 0 ? topCategory.category : 'N/A'}
            </p>
            <p className="text-xs text-amber-400 font-mono">
              {topCategory && topCategory.spent > 0 ? formatCurrency(topCategory.spent) : '$0.00'}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Top Category Share</span>
            <p className="text-base font-extrabold text-slate-100 mt-0.5">
              {topCategory ? `${topCategory.share.toFixed(1)}%` : '0%'}
            </p>
            <p className="text-xs text-slate-400">Of total expenses</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Expense Categories</span>
            <p className="text-base font-extrabold text-slate-100 mt-0.5">
              {categoryAnalysis.filter((c) => c.spent > 0).length} of {categoryAnalysis.length}
            </p>
            <p className="text-xs text-slate-400">Categories used</p>
          </div>
        </div>

      </div>

      {/* Comprehensive Category Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Category Spending Breakdown Table</h3>
          <span className="text-xs text-slate-400">Sorted by highest expenditure</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5 text-right">Amount Spent</th>
                <th className="px-6 py-3.5 text-right">Monthly Budget</th>
                <th className="px-6 py-3.5 text-right">Variance</th>
                <th className="px-6 py-3.5 text-right">Share of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {categoryAnalysis.map((row) => (
                <tr key={row.category} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-sans font-semibold text-slate-100 flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />
                    {row.category}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-100">
                    {formatCurrency(row.spent)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    {formatCurrency(row.limit)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={row.variance >= 0 ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                      {row.variance >= 0 ? `+${formatCurrency(row.variance)}` : `-${formatCurrency(Math.abs(row.variance))}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-300">
                    {row.share.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
