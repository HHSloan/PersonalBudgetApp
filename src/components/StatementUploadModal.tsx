import React, { useState, useRef } from 'react';
import { Transaction, Category, TransactionType } from '../types/budget';
import { formatCurrency, CATEGORIES } from '../utils/formatters';
import { X, UploadCloud, FileSpreadsheet, Check, AlertCircle, Sparkles, Download } from 'lucide-react';

interface StatementUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkImport: (transactions: Omit<Transaction, 'id'>[]) => void;
}

interface ParsedItem {
  id: string;
  selected: boolean;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  note?: string;
}

const autoCategorize = (description: string, amount: number): { category: Category; type: TransactionType } => {
  const upper = description.toUpperCase();
  
  // Income keywords
  if (upper.includes('SALARY') || upper.includes('PAYROLL') || upper.includes('DIRECT DEP') || upper.includes('CLIENT PAYMENT')) {
    return { category: 'Income', type: 'income' };
  }
  if (upper.includes('DIVIDEND') || upper.includes('INTEREST') || upper.includes('INVEST')) {
    return { category: 'Investments', type: 'income' };
  }

  const type: TransactionType = amount > 0 ? 'expense' : 'income';

  // Expense categories
  if (upper.includes('RENT') || upper.includes('MORTGAGE') || upper.includes('HOUSING') || upper.includes('APARTMENT')) {
    return { category: 'Housing', type };
  }
  if (upper.includes('GROCERY') || upper.includes('TRADER') || upper.includes('WHOLE FOODS') || upper.includes('CAFE') || upper.includes('COFFEE') || upper.includes('BISTRO') || upper.includes('RESTAURANT') || upper.includes('BURGER') || upper.includes('CHIPOTLE') || upper.includes('UBER EATS')) {
    return { category: 'Food & Dining', type };
  }
  if (upper.includes('POWER') || upper.includes('ELECTRIC') || upper.includes('WATER') || upper.includes('INTERNET') || upper.includes('VERIZON') || upper.includes('AT&T') || upper.includes('COMCAST') || upper.includes('UTILITY')) {
    return { category: 'Utilities & Bills', type };
  }
  if (upper.includes('UBER') || upper.includes('LYFT') || upper.includes('CHEVRON') || upper.includes('SHELL') || upper.includes('EXXON') || upper.includes('TRANSIT') || upper.includes('PARKING') || upper.includes('GAS')) {
    return { category: 'Transportation', type };
  }
  if (upper.includes('AMAZON') || upper.includes('TARGET') || upper.includes('WALMART') || upper.includes('NIKE') || upper.includes('CLOTHING') || upper.includes('STORE') || upper.includes('MALL')) {
    return { category: 'Shopping', type };
  }
  if (upper.includes('NETFLIX') || upper.includes('SPOTIFY') || upper.includes('HULU') || upper.includes('CINEMA') || upper.includes('STEAM') || upper.includes('CONCERT') || upper.includes('TICKET')) {
    return { category: 'Entertainment', type };
  }
  if (upper.includes('GYM') || upper.includes('FITNESS') || upper.includes('PHARMACY') || upper.includes('CVS') || upper.includes('HEALTH') || upper.includes('DOCTOR')) {
    return { category: 'Health & Fitness', type };
  }

  return { category: 'Miscellaneous', type };
};

const DEMO_STATEMENT_CSV = `Date,Description,Amount
2026-07-28,TRADER JOES #502 GROCERY,112.45
2026-07-29,CHEVRON GASOLINE STATION,48.50
2026-07-30,NETFLIX DIGITAL SUBSCRIPTION,19.99
2026-07-31,FREELANCE PAYMENT RECEIVED,-650.00
2026-08-01,TARGET DEPT STORE #1102,84.30
2026-08-02,LOCAL BISTRO DINNER,64.20
2026-08-03,VERIZON WIRELESS BILL,95.00`;

export const StatementUploadModal: React.FC<StatementUploadModalProps> = ({
  isOpen,
  onClose,
  onBulkImport,
}) => {
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const parseCSVText = (csvContent: string, name: string) => {
    try {
      const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        setError('CSV file appears empty or invalid.');
        return;
      }

      // Check header line
      const headerLine = lines[0].toLowerCase();
      const items: ParsedItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map((cell) => cell.replace(/^["']|["']$/g, '').trim());
        if (row.length < 2) continue;

        // Try extracting Date, Description, Amount
        let dateStr = row[0];
        let descStr = row[1];
        let rawAmountStr = row[2] || '0';

        // Check date format YYYY-MM-DD or MM/DD/YYYY
        let parsedDate = new Date().toISOString().substring(0, 10);
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          parsedDate = dateStr;
        } else if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
          const parts = dateStr.split('/');
          parsedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }

        let numAmount = parseFloat(rawAmountStr.replace(/[^0-9.-]/g, ''));
        if (isNaN(numAmount)) numAmount = 0;

        const isNegative = numAmount < 0;
        const absAmount = Math.abs(numAmount);

        const { category, type } = autoCategorize(descStr, numAmount);
        const finalType: TransactionType = isNegative ? 'income' : type;

        items.push({
          id: `parsed-${i}-${Date.now()}`,
          selected: true,
          title: descStr || 'Statement Transaction',
          amount: absAmount > 0 ? absAmount : 25.00,
          type: finalType,
          category,
          date: parsedDate,
          note: `Imported from ${name}`,
        });
      }

      if (items.length === 0) {
        setError('No valid transactions found in statement.');
        return;
      }

      setParsedItems(items);
      setFileName(name);
      setError('');
    } catch (err) {
      setError('Failed to parse statement file.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      parseCSVText(content, file.name);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadDemo = () => {
    parseCSVText(DEMO_STATEMENT_CSV, 'Demo_Card_Statement.csv');
  };

  const handleToggleSelectAll = (select: boolean) => {
    setParsedItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const handleToggleItem = (id: string) => {
    setParsedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleCategoryChange = (id: string, category: Category) => {
    setParsedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item))
    );
  };

  const handleConfirmImport = () => {
    const selected = parsedItems.filter((i) => i.selected);
    if (selected.length === 0) {
      setError('Please select at least one transaction to import.');
      return;
    }

    const payload = selected.map((item) => ({
      title: item.title,
      amount: item.amount,
      type: item.type,
      category: item.category,
      date: item.date,
      note: item.note,
    }));

    onBulkImport(payload);
    onClose();
  };

  const selectedCount = parsedItems.filter((i) => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="glass-panel w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/80 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-100">Upload Credit Card / Bank Statement</h3>
              <p className="text-xs text-slate-400">Import CSV statements with automatic category matching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Dropzone & Demo Button */}
          {parsedItems.length === 0 ? (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.txt"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/80 bg-slate-900/50 hover:bg-slate-900/80 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">
                    Click to select CSV Statement file
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports Chase, Bank of America, Amex, Apple Card, and standard CSV formats
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">Don't have a statement handy?</span>
                <button
                  type="button"
                  onClick={handleLoadDemo}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700/60 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Sample Card Statement</span>
                </button>
              </div>
            </div>
          ) : (
            /* Parsed Items Preview Table */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    {fileName} ({parsedItems.length} transactions extracted)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSelectAll(true)}
                    className="text-[11px] font-semibold text-emerald-400 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={() => handleToggleSelectAll(false)}
                    className="text-[11px] font-semibold text-slate-400 hover:underline"
                  >
                    Deselect All
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={() => {
                      setParsedItems([]);
                      setFileName('');
                    }}
                    className="text-[11px] font-semibold text-amber-400 hover:underline"
                  >
                    Change File
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedCount === parsedItems.length && parsedItems.length > 0}
                          onChange={(e) => handleToggleSelectAll(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                        />
                      </th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {parsedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => handleToggleItem(item.id)}
                            className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 font-semibold text-slate-100">{item.title}</td>
                        <td className="p-3">
                          <select
                            value={item.category}
                            onChange={(e) => handleCategoryChange(item.id, e.target.value as Category)}
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-slate-400 font-mono">{item.date}</td>
                        <td className="p-3 text-right font-mono font-bold">
                          <span className={item.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          
          {parsedItems.length > 0 && (
            <button
              onClick={handleConfirmImport}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>Import {selectedCount} Selected Transactions</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
