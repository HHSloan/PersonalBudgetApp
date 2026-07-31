import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Wallet, ArrowUpRight, ArrowDownRight, PieChart as PieIcon, BarChart2 } from 'lucide-react';

export default function Dashboard({ transactions, budgetLimits, onOpenAddModal }) {
  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalSavings = transactions
    .filter(t => t.type === 'savings')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Category breakdown for expenses
  const categoryTotals = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

  const categoryColors = {
    Housing: '#6366f1',
    Groceries: '#10b981',
    'Dining Out': '#f43f5e',
    Transportation: '#f59e0b',
    Utilities: '#06b6d4',
    Entertainment: '#a855f7',
    Shopping: '#ec4899',
    Health: '#3b82f6',
    'Other Expense': '#64748b'
  };

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);

  // Donut SVG Generator
  const renderDonutChart = () => {
    if (totalExpense === 0) {
      return <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No expense data logged yet</div>;
    }

    let cumulativePercent = 0;
    const slices = sortedCategories.map(([cat, amount]) => {
      const percent = (amount / totalExpense) * 100;
      const startAngle = (cumulativePercent / 100) * 360;
      cumulativePercent += percent;
      const endAngle = (cumulativePercent / 100) * 360;

      return {
        cat,
        amount,
        percent: Math.round(percent),
        color: categoryColors[cat] || '#8884d8'
      };
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            {slices.reduce((acc, slice, i) => {
              const dashArray = `${slice.percent} ${100 - slice.percent}`;
              const offset = acc.currentOffset;
              acc.currentOffset -= slice.percent;
              acc.elements.push(
                <circle
                  key={slice.cat}
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="16"
                  strokeDasharray={dashArray}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              );
              return acc;
            }, { currentOffset: 25, elements: [] }).elements}
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Spent</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>${totalExpense.toLocaleString()}</span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', width: '100%', fontSize: '13px' }}>
          {slices.slice(0, 6).map(s => (
            <div key={s.cat} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: s.color }} />
              <span style={{ color: 'var(--text-secondary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.cat}</span>
              <span style={{ fontWeight: '700' }}>{s.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Net Cash Flow</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ color: netBalance >= 0 ? 'var(--text-primary)' : '#f43f5e' }}>
            ${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="metric-sub">Net balance after expenses</div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Total Income</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#10b981' }}>
            +${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="metric-sub">Earned this cycle</div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Total Expenses</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#f43f5e' }}>
            -${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="metric-sub">Total money spent</div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Savings Rate</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#a855f7' }}>
            {savingsRate}%
          </div>
          <div className="metric-sub">Of income saved / retained</div>
        </div>
      </div>

      {/* Main Grid: Charts & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Category Breakdown */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieIcon size={18} color="var(--accent-primary)" />
              Expenses by Category
            </h3>
          </div>
          {renderDonutChart()}
        </div>

        {/* Category Spending vs Limit */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="var(--accent-emerald)" />
              Budget Health Check
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(budgetLimits).slice(0, 5).map(([cat, limit]) => {
              const spent = categoryTotals[cat] || 0;
              const percent = Math.min(Math.round((spent / limit) * 100), 100);
              const isOver = spent > limit;
              const isWarning = spent > limit * 0.8 && !isOver;

              return (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: '600' }}>{cat}</span>
                    <span style={{ color: isOver ? '#f43f5e' : 'var(--text-secondary)' }}>
                      ${spent.toLocaleString()} / ${limit.toLocaleString()} ({percent}%)
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percent}%`,
                        background: isOver
                          ? 'var(--gradient-rose)'
                          : isWarning
                          ? 'var(--gradient-amber)'
                          : 'var(--gradient-emerald)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px' }}>Recent Transactions</h3>
          <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={onOpenAddModal}>
            + Add Transaction
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map(t => (
                <tr key={t.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t.date}</td>
                  <td style={{ fontWeight: '600' }}>{t.description}</td>
                  <td>
                    <span className="badge" style={{ background: 'var(--bg-element)' }}>{t.category}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${t.type}`}>
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: t.type === 'income' ? '#10b981' : t.type === 'expense' ? '#f43f5e' : '#a855f7' }}>
                    {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
