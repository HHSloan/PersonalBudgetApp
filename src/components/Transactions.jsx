import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, ArrowUpDown } from 'lucide-react';

export default function Transactions({ transactions, onDelete, onEdit, onOpenAddModal }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  // Filter & Search Logic
  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || t.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Sort Logic
  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'amount') {
      aVal = Number(aVal);
      bVal = Number(bVal);
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Table Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '20px' }}>Transaction History</h2>
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} /> Log Transaction
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by merchant or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select className="form-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="all">All Types (Income, Expense, Savings)</option>
          <option value="income">Income Only</option>
          <option value="expense">Expenses Only</option>
          <option value="savings">Savings Transfers</option>
        </select>

        <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('date')} style={{ cursor: 'pointer' }}>
                Date <ArrowUpDown size={12} style={{ inlineSize: 'auto', marginLeft: '4px' }} />
              </th>
              <th onClick={() => toggleSort('description')} style={{ cursor: 'pointer' }}>
                Description / Merchant <ArrowUpDown size={12} style={{ inlineSize: 'auto', marginLeft: '4px' }} />
              </th>
              <th>Category</th>
              <th>Type</th>
              <th onClick={() => toggleSort('amount')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                Amount <ArrowUpDown size={12} style={{ inlineSize: 'auto', marginLeft: '4px' }} />
              </th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No transactions match your search filter criteria.
                </td>
              </tr>
            ) : (
              sorted.map(t => (
                <tr key={t.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>{t.date}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{t.description}</div>
                    {t.notes && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.notes}</div>}
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'var(--bg-element)' }}>{t.category}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${t.type}`}>
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{
                    textAlign: 'right',
                    fontWeight: '700',
                    fontSize: '15px',
                    color: t.type === 'income' ? '#10b981' : t.type === 'expense' ? '#f43f5e' : '#a855f7'
                  }}>
                    {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <button className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={() => onEdit(t)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-icon" style={{ width: '32px', height: '32px', color: '#f43f5e' }} onClick={() => onDelete(t.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
