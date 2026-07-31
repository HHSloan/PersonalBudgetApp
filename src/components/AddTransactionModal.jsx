import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, FileText } from 'lucide-react';

export default function AddTransactionModal({ isOpen, onClose, onSave, editingTransaction }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState(
    editingTransaction || {
      description: '',
      amount: '',
      type: 'expense',
      category: 'Groceries',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    }
  );

  const categoriesByType = {
    expense: ['Housing', 'Groceries', 'Dining Out', 'Transportation', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Other Expense'],
    income: ['Income', 'Side Income', 'Investments', 'Refunds', 'Other Income'],
    savings: ['Savings', 'Emergency Fund', 'Retirement', 'Investment Account']
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      id: editingTransaction ? editingTransaction.id : `tx-${Date.now()}`
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '20px' }}>{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type Toggle */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className={`btn ${formData.type === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  background: formData.type === 'expense' ? 'var(--gradient-rose)' : undefined,
                  fontSize: '13px'
                }}
                onClick={() => setFormData({ ...formData, type: 'expense', category: categoriesByType.expense[0] })}
              >
                Expense
              </button>
              <button
                type="button"
                className={`btn ${formData.type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  background: formData.type === 'income' ? 'var(--gradient-emerald)' : undefined,
                  fontSize: '13px'
                }}
                onClick={() => setFormData({ ...formData, type: 'income', category: categoriesByType.income[0] })}
              >
                Income
              </button>
              <button
                type="button"
                className={`btn ${formData.type === 'savings' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  background: formData.type === 'savings' ? 'var(--gradient-primary)' : undefined,
                  fontSize: '13px'
                }}
                onClick={() => setFormData({ ...formData, type: 'savings', category: categoriesByType.savings[0] })}
              >
                Savings
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Whole Foods Groceries, Monthly Rent"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categoriesByType[formData.type].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Add payment method, tags, or extra context..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
