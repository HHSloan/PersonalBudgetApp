import React, { useState, useRef } from 'react';
import { Transaction, Category, TransactionType } from '../types/budget';
import { formatCurrency, CATEGORIES } from '../utils/formatters';
import { X, UploadCloud, FileSpreadsheet, Check, AlertCircle, Sparkles, ClipboardList } from 'lucide-react';

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

const MONTH_MAP: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
};

const parseDateStringToISO = (dateStr: string): string | null => {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  const currentYear = new Date().getFullYear();

  // Pattern 1: Aug-02-2026 or Aug-2-2026 or Aug 02, 2026 or Aug 02 2026
  const monthMatch = clean.match(/^([A-Z]{3})[- ]+(\d{1,2})[- ,]+(\d{4})$/i);
  if (monthMatch) {
    const mStr = monthMatch[1].toUpperCase();
    const mm = MONTH_MAP[mStr];
    if (mm) {
      const dd = monthMatch[2].padStart(2, '0');
      const yyyy = monthMatch[3];
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  // Pattern 2: 7/19/2026 or 07/19/2026 or 8/2/2026
  const slashMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const mm = slashMatch[1].padStart(2, '0');
    const dd = slashMatch[2].padStart(2, '0');
    const yyyy = slashMatch[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // Pattern 3: 2026-08-02
  if (clean.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return clean;
  }

  return null;
};

const autoCategorize = (description: string, isCredit: boolean = false): { category: Category; type: TransactionType } => {
  const upper = description.toUpperCase();

  // If marked as Credit (CR) or payment
  if (isCredit || upper.includes('PAYMENT: THANK YOU') || upper.includes('STATEMENT CREDIT') || upper.includes('MERCHANDISE/SERVICE RETURN') || upper.includes('CREDIT ADJUSTMENT')) {
    if (upper.includes('CAMI')) {
      return { category: 'Camille Monthly Take-Home Pay', type: 'income' };
    }
    if (upper.includes('HARR')) {
      return { category: 'Harrison Monthly Take-Home Pay', type: 'income' };
    }
    return { category: 'Misc Income', type: 'income' };
  }

  const type: TransactionType = 'expense';

  // Giving & Generosity
  if (upper.includes('CHRIST COVENANT')) return { category: 'Christ Covenant', type };
  if (upper.includes('PERSECUTED')) return { category: 'Help the Persecuted', type };
  if (upper.includes('THINKING OUT LOUD')) return { category: 'Thinking Out Loud', type };
  if (upper.includes('KAULA')) return { category: 'Kaula Tree', type };
  if (upper.includes('K-LIFE') || upper.includes('KLIFE')) return { category: 'K-Life', type };

  // Utilities & Internet
  if (upper.includes('RED OAK SANITATION') || upper.includes('SAWNEE ELECTRIC') || upper.includes('POWER') || upper.includes('WATER') || upper.includes('SEWER') || upper.includes('GAS SOUTH') || upper.includes('SANITATION')) {
    return { category: 'Utilities (Electricity/Gas/Water/Trash)', type };
  }
  if (upper.includes('COMCAST') || upper.includes('XFINITY') || upper.includes('SPOTIFY') || upper.includes('NETFLIX') || upper.includes('HULU') || upper.includes('INTERNET') || upper.includes('SPECTRUM')) {
    return { category: 'Internet/TV/Spotify', type };
  }

  // Housing
  if (upper.includes('RENT') || upper.includes('MORTGAGE') || upper.includes('HOUSING') || upper.includes('ESCROW')) {
    return { category: 'Mortgage Payment', type };
  }

  // Insurance & Phone
  if (upper.includes('VERIZON') || upper.includes('AT&T') || upper.includes('CELL') || upper.includes('T-MOBILE')) {
    return { category: 'Cell Phone', type };
  }
  if (upper.includes('JEWLERS MUTUAL') || upper.includes('JEWELERS')) {
    return { category: 'Jewlers Mutual Insurance', type };
  }

  // Vehicle
  if (upper.includes('CHEVRON') || upper.includes('SHELL') || upper.includes('BP#') || upper.includes('RACETRAC') || upper.includes('EXXON') || upper.includes('GASOLINE')) {
    return { category: 'Auto Gas', type };
  }
  if (upper.includes('AUTO REPAIR') || upper.includes('TIRE') || upper.includes('MAINTENANCE') || upper.includes('CAR WASH') || upper.includes('SPEED AUTO')) {
    return { category: 'Auto Maintenance', type };
  }
  if (upper.includes('CAR PAYMENT') || upper.includes('AUTO FINANCE') || upper.includes('TOYOTA FINANCIAL') || upper.includes('HONDA FINANCIAL')) {
    return { category: 'Car Payment', type };
  }

  // Food & Dining
  if (upper.includes('KROGER') || upper.includes('VONS') || upper.includes('PUBLIX') || upper.includes('TRADER') || upper.includes('WHOLE FOODS') || upper.includes('FOUR SQUARE') || upper.includes('GROCERY') || upper.includes('FRESH CHOICE') || upper.includes('SUPERMARKET')) {
    return { category: 'Groceries/Food', type };
  }
  if (upper.includes('COFFEE') || upper.includes('CAFE') || upper.includes('STARBUCKS') || upper.includes('DUNKIN') || upper.includes('SALT AND STRAW') || upper.includes('CHICK-FIL-A') || upper.includes('NANDOS') || upper.includes('CRUMBL') || upper.includes('VERVE') || upper.includes('BISTRO') || upper.includes('RESTAURANT') || upper.includes('BURGER') || upper.includes('FERGBURGER') || upper.includes('BOSHAMPS') || upper.includes('WRIGLEY') || upper.includes('EATING OUT') || upper.includes('UBER EATS')) {
    return { category: 'Eating Out', type };
  }

  // Personal & Health & Shopping
  if (upper.includes('OURARING') || upper.includes('GALILEO MEDICAL') || upper.includes('DOCTOR') || upper.includes('HEALTH') || upper.includes('CLINIC') || upper.includes('PHARMACY') || upper.includes('CVS')) {
    return { category: 'Health Expenses', type };
  }
  if (upper.includes('ABEBOOKS') || upper.includes('SHUTTERFLY') || upper.includes('AMAZON') || upper.includes('TARGET') || upper.includes('WALMART') || upper.includes('CLOTHING') || upper.includes('HAIR') || upper.includes('SALON') || upper.includes('BARBER') || upper.includes('NIKE') || upper.includes('STORE')) {
    return { category: 'Clothing/Hair', type };
  }

  return { category: 'Misc/Entertainment', type };
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

const BLOCK_FORMAT_SAMPLE = `Aug-02-2026
CAMI S
Amazon
$43.65
Aug-02-2026
CAMI S
Southwest Airlines
$88.26
Aug-01-2026
HARR S
Red Oak Sanitation
$16.50`;

const TWO_LINE_TABBED_SAMPLE = `7/19/2026
Network Purchase AB* ABEBOOKS.CO LQ4L4D Marcel-Breuer-Str. 12 MUNCHEN BE DE ************4200	($37.10)	$208.99
7/18/2026
Network Purchase SHUTTERFLY, INC. 2800 BRIDGE PARKWAY 6506105200 CA US ************4200	($53.90)	$171.89
7/17/2026
Network Purchase SQ *COFFEE MAN HAPEVIL 601 N Central Ave Atlanta GA US ************4200	($7.61)	$117.99`;

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

  // Multi-Format Statement Parser (2-line tabbed format, 4-line block format, Fidelity single line, and CSV)
  const parseStatementText = (rawContent: string, name: string) => {
    try {
      const lines = rawContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        setError('Statement content appears empty.');
        return;
      }

      const items: ParsedItem[] = [];
      const currentYear = new Date().getFullYear();

      // -------------------------------------------------------------
      // Pass 1: Try 2-Line Tabbed Bank Format
      // Line 1: Date (e.g., "7/19/2026")
      // Line 2: Description \t Amount \t Remaining Balance
      // -------------------------------------------------------------
      let j = 0;
      let is2LineFormatFound = false;

      while (j < lines.length - 1) {
        const potentialDate = parseDateStringToISO(lines[j]);
        if (potentialDate) {
          const detailLine = lines[j + 1];

          // Amount matching: ($37.10) or $37.10 or 37.10 followed by balance or tab
          // e.g. "Network Purchase AB* ABEBOOKS.CO ... ************4200 \t ($37.10) \t $208.99"
          const parts = detailLine.split(/\t+|\s{2,}/);
          if (parts.length >= 2) {
            let rawDesc = parts[0];
            let rawAmountStr = parts[1];

            // If rawAmountStr doesn't look like an amount, check full line regex
            const amountMatch = detailLine.match(/\(?\$?\s*(-?[0-9,]+\.\d{2})\)?(?:CR)?/i);

            if (amountMatch) {
              // Extract description before amount
              const amountIndex = detailLine.indexOf(amountMatch[0]);
              if (amountIndex > 0) {
                rawDesc = detailLine.substring(0, amountIndex).trim();
                rawAmountStr = amountMatch[0];
              }

              is2LineFormatFound = true;
              const isCredit = rawAmountStr.includes('CR') || (rawAmountStr.startsWith('-') && !rawAmountStr.startsWith('($'));
              const numAmount = Math.abs(parseFloat(rawAmountStr.replace(/[^0-9.-]/g, '')));

              // Clean description: strip "Network Purchase", card numbers
              let cleanTitle = rawDesc
                .replace(/^Network\s+Purchase\s+/i, '')
                .replace(/^Purchase\s+/i, '')
                .replace(/\s*\*+\d{4}$/, '')
                .trim();

              if (!cleanTitle) cleanTitle = rawDesc;

              const { category, type } = autoCategorize(cleanTitle, isCredit);

              items.push({
                id: `line2-${j}-${Date.now()}`,
                selected: true,
                title: cleanTitle,
                amount: numAmount > 0 ? numAmount : 10.0,
                type,
                category,
                date: potentialDate,
                note: `Bank Statement Entry`,
              });

              j += 2;
              continue;
            }
          }
        }
        j++;
      }

      // -------------------------------------------------------------
      // Pass 2: Try 4-Line Block Format (Date -> Spender -> Vendor -> Amount)
      // -------------------------------------------------------------
      if (!is2LineFormatFound) {
        let i = 0;
        let isBlockFormatFound = false;

        while (i < lines.length) {
          const potentialDate = parseDateStringToISO(lines[i]);
          if (potentialDate && i + 3 < lines.length) {
            const spenderLine = lines[i + 1];
            const vendorLine = lines[i + 2];
            const amountLine = lines[i + 3];

            const amountMatch = amountLine.match(/^"?\$?\s*(-?[0-9,]+\.\d{2})(CR)?"?$/i);
            if (amountMatch && vendorLine && spenderLine) {
              isBlockFormatFound = true;
              const amountStr = amountMatch[1].replace(/,/g, '');
              const isCR = !!amountMatch[2] || amountStr.startsWith('-');
              const numAmount = Math.abs(parseFloat(amountStr));

              const { category, type } = autoCategorize(vendorLine, isCR);

              items.push({
                id: `block-${i}-${Date.now()}`,
                selected: true,
                title: vendorLine,
                amount: numAmount > 0 ? numAmount : 10.0,
                type,
                category,
                date: potentialDate,
                note: `Spender: ${spenderLine}`,
              });

              i += 4;
              continue;
            }
          }
          i++;
        }

        // -------------------------------------------------------------
        // Pass 3: Single-Line & CSV Formats (Fidelity, standard CSV)
        // -------------------------------------------------------------
        if (!isBlockFormatFound) {
          const fidelityRegex = /^(\d{2}\/\d{2})\s+(\d{2}\/\d{2})?\s*([A-Z0-9]{2,6})?\s+(.+?)\s+\$?([0-9,]+\.\d{2})(CR)?$/i;
          const csvRegex = /^"?(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})"?\s*,\s*"?(.+?)"?\s*,\s*"?\$?(-?[0-9,]+\.\d{2})(CR)?"?$/i;

          lines.forEach((line, idx) => {
            if (
              line.toUpperCase().includes('TOTAL THIS PERIOD') ||
              line.toUpperCase().includes('PAGE ') ||
              (line.toUpperCase().includes('STATEMENT') && !line.includes('$')) ||
              line.toUpperCase().includes('POST DATE') ||
              line.toUpperCase().includes('PAYMENTS AND OTHER CREDITS') ||
              line.toUpperCase().includes('PURCHASES AND OTHER DEBITS') ||
              line.toUpperCase().includes('ACTIVITY SUMMARY')
            ) {
              return;
            }

            // Fidelity Regex
            const fedMatch = line.match(fidelityRegex);
            if (fedMatch) {
              const postDate = fedMatch[1];
              const transDate = fedMatch[2] || postDate;
              const refNo = fedMatch[3] || '';
              const desc = fedMatch[4].trim();
              const amountStr = fedMatch[5].replace(/,/g, '');
              const isCR = !!fedMatch[6];

              const numAmount = parseFloat(amountStr);
              if (!isNaN(numAmount) && numAmount > 0) {
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

            // CSV Regex
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
        }
      }

      if (items.length === 0) {
        setError('No valid transaction lines recognized. Check format and try again.');
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

  const handleLoadDemo2Line = () => {
    setPastedText(TWO_LINE_TABBED_SAMPLE);
    parseStatementText(TWO_LINE_TABBED_SAMPLE, '2Line_Bank_Statement.txt');
  };

  const handleLoadDemoFidelity = () => {
    parseStatementText(FIDELITY_STATEMENT_SAMPLE, 'Fidelity_Rewards_Visa_Statement.pdf');
  };

  const handleLoadDemoBlock = () => {
    setPastedText(BLOCK_FORMAT_SAMPLE);
    parseStatementText(BLOCK_FORMAT_SAMPLE, '4Line_Block_Statement.txt');
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
              <h3 className="text-lg font-extrabold text-slate-100">Credit Card & Statement Parser</h3>
              <p className="text-xs text-slate-400">Supports 2-line tabbed statements, 4-line block format, Fidelity, Chase, CSV</p>
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
                        Supports 2-line tabbed, 4-line block format, Fidelity Rewards, Chase, BofA CSV/TXT
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={8}
                    placeholder={`Paste your statement text here.

Format Option 1 (2-Line Tabbed Bank Format):
7/19/2026
Network Purchase AB* ABEBOOKS.CO LQ4L4D... ($37.10) $208.99

Format Option 2 (4-Line Block Format):
Aug-02-2026
CAMI S
Amazon
$43.65`}
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

              {/* Sample Statement Loader Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">Test with sample format:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadDemo2Line}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700/60 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load 2-Line Tabbed Sample</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadDemoBlock}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-slate-700/60 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load 4-Line Sample</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadDemoFidelity}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold border border-slate-700/60 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load Fidelity Sample</span>
                  </button>
                </div>
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
                      <th className="p-3">Vendor / Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Note</th>
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
                        <td className="p-3 text-slate-400 text-[11px] italic">{item.note || '-'}</td>
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
