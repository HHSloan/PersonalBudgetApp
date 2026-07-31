import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

export default function BudgetPlanner({ budgetLimits, transactions, onUpdateLimits }) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [newLimitValue, setNewLimitValue] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Calculate spent amounts for the current month
  const categorySpent = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categorySpent[t.category] = (categorySpent[t.category] || 0) + Number(t.amount);
    });

  const handleSaveLimit = (cat) => {
    const val = parseFloat(newLimitValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateLimits({ ...budgetLimits, [cat]: val });
    }
    setEditingCategory(null);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const val = parseFloat(newLimitValue);
    if (newCategoryName && !isNaN(val) && val >= 0) {
      onUpdateLimits({ ...budgetLimits, [newCategoryName]: val });
      setNewCategoryName('');
      setNewLimitValue('');
      setShowAddCategory(false);
    }
  };

  const handleDeleteLimit = (cat) => {
    const updated = { ...budgetLimits };
    delete updated[cat];
    onUpdateLimits(updated);
  };

  const totalBudgeted = Object.values(budgetLimits).reduce((a, b) => a + Number(b), 0);
  const totalSpentInBudgeted = Object.keys(budgetLimits).reduce((acc, cat) => acc + (categorySpent[cat] || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Card */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={22} color="var(--accent-primary)" />
            Category Budget Limits
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Set monthly spending caps for each expense category to stay on track.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddCategory(!showAddCategory)}>
          <Plus size={16} /> Add Budget Category
        </button>
      </div>

      {/* Add New Category Form */}
      {showAddCategory && (
        <form className="glass-card" onSubmit={handleAddCategory} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Subscriptions, Fitness"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Monthly Target ($)</label>
            <input
              type="number"
              step="10"
              className="form-input"
              placeholder="300"
              value={newLimitValue}
              onChange={(e) => setNewLimitValue(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddCategory(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Total Budget Summary */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: '700' }}>Overall Monthly Budget Progress</span>
          <span style={{ fontWeight: '700' }}>
            ${totalSpentInBudgeted.toLocaleString()} / ${totalBudgeted.toLocaleString()}
          </span>
        </div>
        <div className="progress-bar-bg" style={{ height: '12px' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(100, Math.round((totalSpentInBudgeted / (totalBudgeted || 1)) * 100))}%`,
              background: totalSpentInBudgeted > totalBudgeted ? 'var(--gradient-rose)' : 'var(--gradient-primary)'
            }}
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {Object.entries(budgetLimits).map(([category, limit]) => {
          const spent = categorySpent[category] || 0;
          const percent = Math.min(Math.round((spent / limit) * 100), 100);
          const isOver = spent > limit;
          const isWarning = spent > limit * 0.85 && !isOver;

          return (
            <div key={category} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{category}</h3>
                {isOver ? (
                  <span className="badge badge-expense" style={{ gap: '4px' }}>
                    <AlertTriangle size={12} /> Over Limit
                  </span>
                ) : isWarning ? (
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                    Warning
                  </span>
                ) : (
                  <span className="badge badge-income" style={{ gap: '4px' }}>
                    <CheckCircle size={12} /> On Track
                  </span>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Spent: <strong>${spent.toLocaleString()}</strong></span>
                  <span style={{ color: 'var(--text-secondary)' }}>Limit: <strong>${limit.toLocaleString()}</strong></span>
                </div>
                <div className="progress-bar-bg" style={{ height: '10px' }}>
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

              {editingCategory === category ? (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="number"
                    className="form-input"
                    defaultValue={limit}
                    onChange={(e) => setNewLimitValue(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '13px' }}
                  />
                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleSaveLimit(category)}>
                    Save
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setEditingCategory(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <button
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600' }}
                    onClick={() => {
                      setEditingCategory(category);
                      setNewLimitValue(limit.toString());
                    }}
                  >
                    Edit Limit
                  </button>
                  <button
                    style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                    onClick={() => handleDeleteLimit(category)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
