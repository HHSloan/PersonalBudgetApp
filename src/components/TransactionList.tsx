import React, { useState } from 'react';
import { Transaction, FilterOptions } from '../types/budget';
import { formatCurrency, formatDate, CATEGORIES } from '../utils/formatters';
import {
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  Calendar,
  ArrowUpDown,
  FileText,
  Tag,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onOpenEditModal: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteTransaction,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    category: 'all',
    type: 'all',
    sortBy: 'date-desc',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter logic
  const filteredTransactions = transactions.filter((t) => {
    // Search matching
    const matchesSearch =
      t.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(filters.searchQuery.toLowerCase()));

    // Category matching
    const matchesCategory = filters.category === 'all' || t.category === filters.category;

    // Type matching
    const matchesType = filters.type === 'all' || t.type === filters.type;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Sorting logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (filters.sortBy === 'date-desc') return b.date.localeCompare(a.date);
    if (filters.sortBy === 'date-asc') return a.date.localeCompare(b.date);
    if (filters.sortBy === 'amount-desc') return b.amount - a.amount;
    if (filters.sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      type: 'all',
      sortBy: 'date-desc',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Bar */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">Transactions Ledger</h2>
            <p className="text-xs text-slate-400">
              Showing {sortedTransactions.length} of {transactions.length} total entries
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description or notes..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500/80 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/80 transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
            {['all', 'income', 'expense'].map((t) => (
              <button
                key={t}
                onClick={() => setFilters((prev) => ({ ...prev, type: t }))}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  filters.type === t
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/80 transition-colors appearance-none cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

        </div>

        {/* Clear Filters indicator if active */}
        {(filters.searchQuery || filters.category !== 'all' || filters.type !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>Filtered view active</span>
            <button
              onClick={handleResetFilters}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Transactions Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {sortedTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Description & Note */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">{tx.title}</div>
                      {tx.note && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>{tx.note}</span>
                        </div>
                      )}
                    </td>

                    {/* Category Badge */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700/60 text-slate-300">
                        {tx.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(tx.date)}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => onOpenEditModal(tx)}
                          title="Edit Transaction"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button / Confirmation */}
                        {deleteConfirmId === tx.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                onDeleteTransaction(tx.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-1 rounded-md bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded-md bg-slate-700 text-slate-300 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(tx.id)}
                            title="Delete Transaction"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors border border-rose-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4 text-slate-400">
            <p className="text-base font-semibold text-slate-300">No matching transactions found</p>
            <p className="text-xs mt-1">Try adjusting your search criteria or add a new transaction.</p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-emerald-400 text-xs font-bold hover:bg-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
