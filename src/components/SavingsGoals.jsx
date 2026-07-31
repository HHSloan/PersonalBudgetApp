import React, { useState } from 'react';
import { PiggyBank, Plus, Calendar, DollarSign, CheckCircle2, TrendingUp, Trash2 } from 'lucide-react';

export default function SavingsGoals({ savingsGoals, onUpdateGoals }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    color: '#6366f1'
  });

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;

    const created = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount || 0)
    };

    onUpdateGoals([...savingsGoals, created]);
    setNewGoal({ name: '', targetAmount: '', currentAmount: '', targetDate: '', color: '#6366f1' });
    setShowAddModal(false);
  };

  const handleAddDeposit = (e) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (depositModalGoal && !isNaN(amount) && amount > 0) {
      const updated = savingsGoals.map(g => {
        if (g.id === depositModalGoal.id) {
          return { ...g, currentAmount: g.currentAmount + amount };
        }
        return g;
      });
      onUpdateGoals(updated);
      setDepositAmount('');
      setDepositModalGoal(null);
    }
  };

  const handleDeleteGoal = (id) => {
    onUpdateGoals(savingsGoals.filter(g => g.id !== id));
  };

  const totalSaved = savingsGoals.reduce((acc, g) => acc + Number(g.currentAmount), 0);
  const totalTarget = savingsGoals.reduce((acc, g) => acc + Number(g.targetAmount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PiggyBank size={22} color="var(--accent-secondary)" />
            Savings Goals Tracker
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Track progress towards your long-term wealth targets and financial milestones.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Create Savings Goal
        </button>
      </div>

      {/* Overview Metric Card */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(6,182,212,0.12) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Savings Goal Progress</div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--accent-secondary)' }}>
              ${totalSaved.toLocaleString()} <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '400' }}>/ ${totalTarget.toLocaleString()}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
              {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Target Achieved</div>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {savingsGoals.map(goal => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div key={goal.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{goal.name}</h3>
                  {goal.targetDate && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Calendar size={12} /> Target: {goal.targetDate}
                    </div>
                  )}
                </div>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  onClick={() => handleDeleteGoal(goal.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    ${goal.currentAmount.toLocaleString()}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Target: ${goal.targetAmount.toLocaleString()}
                  </span>
                </div>
                <div className="progress-bar-bg" style={{ height: '12px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${percent}%`,
                      background: `linear-gradient(90deg, ${goal.color || '#6366f1'} 0%, #a855f7 100%)`
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px', color: 'var(--text-muted)' }}>
                  <span>{percent}% Completed</span>
                  <span>${remaining.toLocaleString()} remaining</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                  onClick={() => setDepositModalGoal(goal)}
                >
                  + Add Deposit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>New Savings Goal</h2>
            <form onSubmit={handleAddGoal}>
              <div className="form-group">
                <label className="form-label">Goal Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Emergency Fund, House Down Payment"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Target Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="5000"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="1000"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Completion Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Deposit Modal */}
      {depositModalGoal && (
        <div className="modal-overlay" onClick={() => setDepositModalGoal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Add Deposit to {depositModalGoal.name}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Current saved: ${depositModalGoal.currentAmount.toLocaleString()} of ${depositModalGoal.targetAmount.toLocaleString()}
            </p>
            <form onSubmit={handleAddDeposit}>
              <div className="form-group">
                <label className="form-label">Deposit Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="250.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setDepositModalGoal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Deposit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
