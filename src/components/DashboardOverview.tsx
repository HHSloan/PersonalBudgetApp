import React from 'react';
import { Transaction, BudgetLimit } from '../types/budget';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DashboardOverviewProps {
  transactions: Transaction[];
  budgetLimits: BudgetLimit[];
  onNavigateToTransactions: () => void;
  onNavigateToBudgets: () => void;
  onOpenAddModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  transactions,
  budgetLimits,
  onNavigateToTransactions,
  onNavigateToBudgets,
  onOpenAddModal,
}) => {
  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0';

  // Category Breakdown for Pie Chart
  const expenseByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(expenseByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
    color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#64748b',
  }));

  // Bar Chart Data (Monthly Income vs Expense)
  // Group by YYYY-MM
  const monthlyDataMap: Record<string, { month: string; income: number; expense: number }> = {};
  
  // Ensure chronologically sorted list
  const sortedTx = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  sortedTx.forEach((t) => {
    const monthKey = t.date.substring(0, 7); // '2026-07'
    const dateObj = new Date(t.date + 'T00:00:00');
    const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = { month: monthLabel, income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      monthlyDataMap[monthKey].income += t.amount;
    } else {
      monthlyDataMap[monthKey].expense += t.amount;
    }
  });

  const barChartData = Object.values(monthlyDataMap);

  // Check budget warnings
  const overBudgetCategories = budgetLimits.filter((limit) => {
    const spent = expenseByCategory[limit.category] || 0;
    return spent > limit.limit;
  });

  // Recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Alert Banner for Over-Budget Categories */}
      {overBudgetCategories.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 backdrop-blur-md animate-soft-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Budget Limit Exceeded!</p>
              <p className="text-xs text-rose-200/80">
                {overBudgetCategories.length} category({overBudgetCategories.length > 1 ? 's' : ''}) spending exceed monthly budget limits.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToBudgets}
            className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-colors shadow-md"
          >
            Review Budgets
          </button>
        </div>
      )}

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net Balance */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Balance</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-extrabold tracking-tight ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(netBalance)}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>Overall status</span>
              {netBalance >= 0 ? (
                <span className="text-emerald-400 font-semibold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Positive
                </span>
              ) : (
                <span className="text-rose-400 font-semibold flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" /> Deficit
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Total Income */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold tracking-tight text-teal-300">
              {formatCurrency(totalIncome)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Total revenue collected</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold tracking-tight text-rose-400">
              {formatCurrency(totalExpenses)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Outflow spending total</p>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Savings Rate</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold tracking-tight text-cyan-300">
              {savingsRate}%
            </h3>
            <p className="text-xs text-slate-400 mt-1">Of net income saved</p>
          </div>
        </div>

      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income vs Expenses Comparison (Bar Chart) */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Income vs Expenses</h3>
              <p className="text-xs text-slate-400">Monthly financial comparison</p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <RechartsTooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown (Pie Chart) */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Spending by Category</h3>
              <p className="text-xs text-slate-400">Expense allocation distribution</p>
            </div>
          </div>

          {pieChartData.length > 0 ? (
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: '12px', paddingLeft: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
              No expense data recorded yet.
            </div>
          )}
        </div>

      </div>

      {/* Recent Activity Section */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest financial activities</p>
          </div>
          <button
            onClick={onNavigateToTransactions}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View All ({transactions.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-800/60">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{tx.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/50">
                        {tx.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(tx.date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            No transactions found. Click "Add Transaction" to create your first entry!
          </div>
        )}
      </div>

    </div>
  );
};
