import React, { useState, useRef } from 'react';
import { Transaction, Category, TransactionType } from '../types/budget';
import { formatCurrency, CATEGORIES } from '../utils/formatters';
import { X, UploadCloud, FileSpreadsheet, Check, AlertCircle, Sparkles, FileText, ClipboardList } from 'lucide-react';

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

const autoCategorize = (description: string, isCredit: boolean = false): { category: Category; type: TransactionType } => {
  const upper = description.toUpperCase();

  // If marked as Credit (CR) or payment
  if (isCredit || upper.includes('PAYMENT: THANK YOU') || upper.includes('STATEMENT CREDIT') || upper.includes('MERCHANDISE/SERVICE RETURN') || upper.includes('CREDIT ADJUSTMENT')) {
    if (upper.includes('RETURN') || upper.includes('CREDIT')) {
      return { category: 'Miscellaneous', type: 'income' };
    }
    return { category: 'Income', type: 'income' };
  }

  const type: TransactionType = 'expense';

  // Expense categories based on keywords (including Fidelity statement vendors)
  if (upper.includes('RENT') || upper.includes('MORTGAGE') || upper.includes('HOUSING') || upper.includes('HOTEL') || upper.includes('AUTOGRAPH') || upper.includes('GODLEY')) {
    return { category: 'Housing', type };
  }

  if (
    upper.includes('KROGER') ||
    upper.includes('VONS') ||
    upper.includes('PUBLIX') ||
    upper.includes('TRADER') ||
    upper.includes('WHOLE FOODS') ||
    upper.includes('FOUR SQUARE') ||
    upper.includes('FRESH CHOICE') ||
    upper.includes('CAFE') ||
    upper.includes('COFFEE') ||
    upper.includes('STARBUCKS') ||
    upper.includes('DUNKIN') ||
    upper.includes('SALT AND STRAW') ||
    upper.includes('CHICK-FIL-A') ||
    upper.includes('NANDOS') ||
    upper.includes('CRUMBL') ||
    upper.includes('VERVE') ||
    upper.includes('BISTRO') ||
    upper.includes('RESTAURANT') ||
    upper.includes('BURGER') ||
    upper.includes('FERGBURGER') ||
    upper.includes('BOSHAMPS') ||
    upper.includes('PIES') ||
    upper.includes('JOHNNY') ||
    upper.includes('GOOD EATING') ||
    upper.includes('VIDA') ||
    upper.includes('WRIGLEY')
  ) {
    return { category: 'Food & Dining', type };
  }

  if (
    upper.includes('SAWNEE ELECTRIC') ||
    upper.includes('POWER') ||
    upper.includes('WATER') ||
    upper.includes('SEWER') ||
    upper.includes('COMCAST') ||
    upper.includes('XFINITY') ||
    upper.includes('VERIZON') ||
    upper.includes('AT&T') ||
    upper.includes('UTILITY')
  ) {
    return { category: 'Utilities & Bills', type };
  }

  if (
    upper.includes('DELTA') ||
    upper.includes('UNITED') ||
    upper.includes('QANTAS') ||
    upper.includes('SOUTHWES') ||
    upper.includes('UBER') ||
    upper.includes('LYFT') ||
    upper.includes('CHEVRON') ||
    upper.includes('SHELL') ||
    upper.includes('BP#') ||
    upper.includes('RACETRAC') ||
    upper.includes('GAS') ||
    upper.includes('CIRCLEK') ||
    upper.includes('TRANSIT') ||
    upper.includes('RIDEYELLOW')
  ) {
    return { category: 'Transportation', type };
  }

  if (
    upper.includes('AMAZON') ||
    upper.includes('TARGET') ||
    upper.includes('WALMART') ||
    upper.includes('PATAGONIA') ||
    upper.includes('HOBBY LOBBY') ||
    upper.includes('PAINTED PICKLE') ||
    upper.includes('HUDSONS') ||
    upper.includes('CLOTHING') ||
    upper.includes('STORE') ||
    upper.includes('SMITHS CRAFT')
  ) {
    return { category: 'Shopping', type };
  }

  if (
    upper.includes('SPOTIFY') ||
    upper.includes('NETFLIX') ||
    upper.includes('ANCESTRYCOM') ||
    upper.includes('KIWI PARK') ||
    upper.includes('SKYLINE') ||
    upper.includes('WANAKA LAVENDER') ||
    upper.includes('CINEMA') ||
    upper.includes('TICKET')
  ) {
    return { category: 'Entertainment', type };
  }

  if (
    upper.includes('OURARING') ||
    upper.includes('GALILEO MEDICAL') ||
    upper.includes('GYM') ||
    upper.includes('PHARMACY') ||
    upper.includes('DOCTOR')
  ) {
    return { category: 'Health & Fitness', type };
  }

  return { category: 'Miscellaneous', type };
};

const FIDELITY_STATEMENT_SAMPLE = `HARRISON S - 5308: Purchases and Other Debits
04/21 04/21 4561 Amazon.com*BS4279I82 Amzn.com/bill WA $12.09
04/22 04/21 5288 SAWNEE ELECTRIC MEMBER SAWNEE.SMARTH GA $80.15
04/22 04/21 4002 KROGER #495 ALPHARETTA GA $129.58
04/22 04/21 2065 SQ *THE COFFEE COUNTER Atlanta GA $3.53
04/23 04/22 2194 DELTA 0062424355825 800-221-1212 GA $596.80
04/24 04/23 4409 OURARING INC. 415-226-4726 CA $69.99
04/27 04/24 0143 PP*SPOTIFY*P41BF5C337 402-935-7733 NY $21.99
04/27 04/24 9237 TST* VERVE COFFEE ROAS MANHATTAN BEA CA $6.95
04/27 04/24 9310 TST* SALT AND STRAW - MANHATTAN BEA CA $10.27
05/04 05/02 7924 PAYPAL *UBER 402-935-7733 CA $25.76
05/04 05/02 6666 SQ *RIDEYELLOW Torrance CA $36.00
05/04 05/04 ET PAYMENT: THANK YOU $1,165.00CR
05/05 05/04 9589 KROGER #444 ALPHARETTA GA $140.32
05/06 05/05 5541 COMCAST / XFINITY 800-266-2278 GA $61.05
05/07 05/06 8971 DUNKIN #355760 CHICAGO IL $37.97
05/08 05/07 9694 PAYPAL *STARBUCKSSE 402-935-7733 WA $18.44
05/11 05/08 4598 PUBLIX SUPERMARKETS #1 NICEVILLE FL $12.84
05/12 05/11 6389 PAYPAL *CHICK-FIL-A AP 402-935-7733 GA $18.07
05/18 05/17 7849 GAS SOUTH PAYMENT 877-472-4932 GA $90.99`;

export const StatementUploadModal: React.FC<StatementUploadModalProps> = ({
  isOpen,
  onClose,
  onBulkImport,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState<string>('');
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Fidelity / Elan & Multi-Format Statement Parser
  const parseStatementText = (rawContent: string, name: string) => {
    try {
      const lines = rawContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        setError('Statement content appears empty.');
        return;
      }

      const items: ParsedItem[] = [];
      const currentYear = new Date().getFullYear();

      // Fidelity / Elan Statement Regex matcher:
      // Post Date (MM/DD), Trans Date (MM/DD), Ref# (4 digits or ET), Description, Amount (with optional CR)
      // e.g., "04/21 04/21 4561 Amazon.com*BS4279I82 Amzn.com/bill WA $12.09"
      const fidelityRegex = /^(\d{2}\/\d{2})\s+(\d{2}\/\d{2})?\s*([A-Z0-9]{2,6})?\s+(.+?)\s+\$?([0-9,]+\.\d{2})(CR)?$/i;

      // Alternative regex for simpler format: "MM/DD/YYYY, Description, Amount"
      const csvRegex = /^"?(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})"?\s*,\s*"?(.+?)"?\s*,\s*"?\$?(-?[0-9,]+\.\d{2})(CR)?"?$/i;

      lines.forEach((line, idx) => {
        // Skip header lines or summary totals
        if (
          line.toUpperCase().includes('TOTAL THIS PERIOD') ||
          line.toUpperCase().includes('PAGE ') ||
          line.toUpperCase().includes('STATEMENT') && !line.includes('$') ||
          line.toUpperCase().includes('POST DATE') ||
          line.toUpperCase().includes('PAYMENTS AND OTHER CREDITS') ||
          line.toUpperCase().includes('PURCHASES AND OTHER DEBITS') ||
          line.toUpperCase().includes('ACTIVITY SUMMARY')
        ) {
          return;
        }

        // Try Fidelity / Elan Regex
        const fedMatch = line.match(fidelityRegex);
        if (fedMatch) {
          const postDate = fedMatch[1]; // "04/21"
          const transDate = fedMatch[2] || postDate;
          const refNo = fedMatch[3] || '';
          const desc = fedMatch[4].trim();
          const amountStr = fedMatch[5].replace(/,/g, '');
          const isCR = !!fedMatch[6];

          const numAmount = parseFloat(amountStr);
          if (!isNaN(numAmount) && numAmount > 0) {
            // Format ISO Date YYYY-MM-DD
            const [mm, dd] = transDate.split('/');
            const isoDate = `${currentYear}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;

            const { category, type } = autoCategorize(desc, isCR);

            items.push({
              id: `fed-${idx}-${Date.now()}`,
              selected: true,
              title: desc,
              amount: numAmount,
              type,
              category,
              date: isoDate,
              note: `Fidelity Statement (Ref #${refNo})`,
            });
            return;
          }
        }

        // Try CSV Regex
        const csvMatch = line.match(csvRegex);
        if (csvMatch) {
          let dateStr = csvMatch[1];
          const desc = csvMatch[2].trim();
          let amountStr = csvMatch[3].replace(/,/g, '');
          const isCR = !!csvMatch[4] || amountStr.startsWith('-');

          let numAmount = Math.abs(parseFloat(amountStr));
          if (!isNaN(numAmount) && numAmount > 0) {
            let isoDate = new Date().toISOString().substring(0, 10);
            if (dateStr.includes('-')) {
              isoDate = dateStr;
            } else if (dateStr.includes('/')) {
              const parts = dateStr.split('/');
              const year = parts[2] ? (parts[2].length === 2 ? `20${parts[2]}` : parts[2]) : `${currentYear}`;
              isoDate = `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
            }

            const { category, type } = autoCategorize(desc, isCR);

            items.push({
              id: `csv-${idx}-${Date.now()}`,
              selected: true,
              title: desc,
              amount: numAmount,
              type,
              category,
              date: isoDate,
              note: `Imported from ${name}`,
            });
          }
        }
      });

      if (items.length === 0) {
        setError('No valid transaction lines recognized. Try using the "Paste Statement Text" tab or check file formatting.');
        return;
      }

      setParsedItems(items);
      setFileName(name);
      setError('');
    } catch (err) {
      setError('Error processing statement text.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      parseStatementText(content, file.name);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      setError('Please paste your statement text into the text area first.');
      return;
    }
    parseStatementText(pastedText, 'Pasted_Statement_Text');
  };

  const handleLoadDemoFidelity = () => {
    parseStatementText(FIDELITY_STATEMENT_SAMPLE, 'Fidelity_Rewards_Visa_Statement.pdf');
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
              <h3 className="text-lg font-extrabold text-slate-100">Fidelity & Credit Card Statement Parser</h3>
              <p className="text-xs text-slate-400">Supports Fidelity Rewards Visa, Chase, Amex, CSV, and text statements</p>
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

          {/* If no parsed items yet */}
          {parsedItems.length === 0 ? (
            <div className="space-y-4">
              
              {/* Tab Selector: File Upload vs Paste Text */}
              <div className="flex items-center bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'upload'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload File (.csv, .txt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'paste'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Paste Statement Text</span>
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div className="space-y-3">
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
                        Click to select statement file (.csv or .txt)
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Supports Fidelity Rewards Visa (Elan), Chase, BofA, Amex, Apple Card CSV/TXT
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={7}
                    placeholder={`Copy and paste lines directly from your Fidelity or credit card statement PDF...

Example lines:
04/22 04/21 4002 KROGER #495 ALPHARETTA GA $129.58
04/23 04/22 2194 DELTA AIRLINES GA $596.80
05/04 05/04 ET PAYMENT: THANK YOU $1,165.00CR
05/12 05/11 6389 PAYPAL *CHICK-FIL-A AP GA $18.07`}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleParsePastedText}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01]"
                  >
                    Parse Pasted Text
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">Test with sample statement:</span>
                <button
                  type="button"
                  onClick={handleLoadDemoFidelity}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold border border-slate-700/60 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Fidelity Credit Card Sample</span>
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
                      setPastedText('');
                    }}
                    className="text-[11px] font-semibold text-amber-400 hover:underline"
                  >
                    Clear & Start Over
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedCount === parsedItems.length && parsedItems.length > 0}
                          onChange={(e) => handleToggleSelectAll(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
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
                        <td className="p-3 font-semibold text-slate-100 max-w-xs truncate">{item.title}</td>
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
