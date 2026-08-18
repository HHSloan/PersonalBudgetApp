import React, { useState, useRef, useEffect } from 'react';
import { Transaction, FilterOptions, Category } from '../types/budget';
import { formatCurrency, formatDate, CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/formatters';
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
  ChevronDown,
  FileSpreadsheet,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onOpenUploadModal: () => void;
  onOpenEditModal: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction?: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onOpenAddModal,
  onOpenUploadModal,
  onOpenEditModal,
  onDeleteTransaction,
  onUpdateTransaction,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    category: 'all',
    type: 'all',
    sortBy: 'date-desc',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    // Date Range matching
    const matchesStartDate = !filters.startDate || t.date >= filters.startDate;
    const matchesEndDate = !filters.endDate || t.date <= filters.endDate;

    return matchesSearch && matchesCategory && matchesType && matchesStartDate && matchesEndDate;
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
      startDate: '',
      endDate: '',
    });
  };

  const handleSetDatePreset = (preset: 'this-month' | 'last-30' | 'ytd') => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (preset === 'this-month') {
      const firstDay = `${yyyy}-${mm}-01`;
      const lastDayObj = new Date(yyyy, today.getMonth() + 1, 0);
      const lastDayStr = `${yyyy}-${mm}-${String(lastDayObj.getDate()).padStart(2, '0')}`;
      setFilters((prev) => ({ ...prev, startDate: firstDay, endDate: lastDayStr }));
    } else if (preset === 'last-30') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      const pastY = d.getFullYear();
      const pastM = String(d.getMonth() + 1).padStart(2, '0');
      const pastD = String(d.getDate()).padStart(2, '0');
      setFilters((prev) => ({ ...prev, startDate: `${pastY}-${pastM}-${pastD}`, endDate: todayStr }));
    } else if (preset === 'ytd') {
      setFilters((prev) => ({ ...prev, startDate: `${yyyy}-01-01`, endDate: todayStr }));
    }
  };

  const isFilterActive =
    !!filters.searchQuery ||
    filters.category !== 'all' ||
    filters.type !== 'all' ||
    !!filters.startDate ||
    !!filters.endDate;

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

          {/* Dropdown CTA */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Transaction</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl border border-slate-700/80 py-1.5 z-50 animate-fadeIn">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenAddModal();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-100 hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div>Add Transaction</div>
                    <span className="text-[10px] text-slate-400 font-normal">Create single entry manually</span>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-800/80" />

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenUploadModal();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-100 hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                  <div>
                    <div>Upload Statement</div>
                    <span className="text-[10px] text-slate-400 font-normal">Import credit card or bank CSV</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls Row 1: Search, Category, Type, Sort */}
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

        {/* Filter Controls Row 2: Date Range Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Date Range:</span>
            </div>

            {/* Start Date Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">From</span>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* End Date Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">To</span>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleSetDatePreset('this-month')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px] hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => handleSetDatePreset('last-30')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px] hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handleSetDatePreset('ytd')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px] hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
            >
              YTD
            </button>
            {(filters.startDate || filters.endDate) && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, startDate: '', endDate: '' }))}
                className="px-2 py-1 rounded-lg text-slate-400 hover:text-amber-400 text-[11px] underline"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {isFilterActive && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Filtered view active ({sortedTransactions.length} results)</span>
            </span>
            <button
              onClick={handleResetFilters}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Reset All Filters
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

                    {/* Category Selector (Inline Editable) */}
                    <td className="px-6 py-4">
                      <select
                        value={tx.category}
                        onChange={(e) => {
                          const newCategory = e.target.value as Category;
                          if (onUpdateTransaction) {
                            onUpdateTransaction({ ...tx, category: newCategory });
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors cursor-pointer ${
                          !tx.category
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 italic'
                            : 'bg-slate-900/90 border-slate-700/80 hover:border-emerald-500/80 text-slate-200 focus:border-emerald-500'
                        }`}
                      >
                        <option value="" className="text-amber-400 italic font-bold">
                          -- Unassigned --
                        </option>
                        {(tx.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        {tx.category && !(tx.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).includes(tx.category) && (
                          <option value={tx.category}>{tx.category}</option>
                        )}
                      </select>
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
                              className="px-2 py-1 rounded-md bg-amber-400 text-slate-950 text-xs font-extrabold hover:bg-amber-300"
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
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors border border-amber-500/20"
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
