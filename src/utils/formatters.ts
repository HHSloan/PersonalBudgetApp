import { Category } from '../types/budget';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const INCOME_CATEGORIES: Category[] = [
  'Camille Monthly Take-Home Pay',
  'Harrison Monthly Take-Home Pay',
  'Gross Income',
  'Misc Income',
  'Camille Total Monthly Pre-Tax Income',
  'Harrison Total Monthly Pre-Tax Income',
];

export const EXPENSE_CATEGORIES: Category[] = [
  'Christ Covenant',
  'Help the Persecuted',
  'Thinking Out Loud',
  'Kaula Tree',
  'K-Life',
  'Misc Giving/Discipleship/Generosity',
  'Camille 401k Witholdings',
  'Harrison 401k Withholdings',
  'HSA Withholdings',
  'Roth IRA Contribution: Camille',
  'Roth IRA Contribution: Harrison',
  'Personal Savings',
  'Adoption Fund',
  'Mortgage Payment',
  'Utilities (Electricity/Gas/Water/Trash)',
  'Internet/TV/Spotify',
  'Homeowners Insurance',
  'Auto Insurance',
  'Umbrella Policy',
  'Jewlers Mutual Insurance',
  'Cell Phone',
  'Car Payment',
  'Groceries/Food',
  'Eating Out',
  'Clothing/Hair',
  'Auto Gas',
  'Auto Maintenance',
  'Misc/Entertainment',
  'House Expenses',
  'Health Expenses',
  'TBD',
];

export const CATEGORIES: Category[] = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
];

export const CATEGORY_COLORS: Record<Category, string> = {
  // Giving & Generosity (Emeralds / Teals / Gold)
  'Christ Covenant': '#10b981',
  'Help the Persecuted': '#14b8a6',
  'Thinking Out Loud': '#06b6d4',
  'Kaula Tree': '#22c55e',
  'K-Life': '#84cc16',
  'Misc Giving/Discipleship/Generosity': '#eab308',

  // Savings & Investments (Cyan / Blues / Indigo)
  'Camille 401k Witholdings': '#0284c7',
  'Harrison 401k Withholdings': '#2563eb',
  'HSA Withholdings': '#3b82f6',
  'Roth IRA Contribution: Camille': '#6366f1',
  'Roth IRA Contribution: Harrison': '#4f46e5',
  'Personal Savings': '#0d9488',
  'Adoption Fund': '#8b5cf6',

  // Housing & Living (Purples / Blues / Slate)
  'Mortgage Payment': '#6366f1',
  'Utilities (Electricity/Gas/Water/Trash)': '#0284c7',
  'Internet/TV/Spotify': '#a855f7',
  'House Expenses': '#64748b',

  // Insurance (Violet / Cyan)
  'Homeowners Insurance': '#7c3aed',
  'Auto Insurance': '#6366f1',
  'Umbrella Policy': '#4338ca',
  'Jewlers Mutual Insurance': '#ec4899',

  // Vehicle & Transportation (Orange / Amber / Yellow)
  'Car Payment': '#f97316',
  'Auto Gas': '#f59e0b',
  'Auto Maintenance': '#d97706',

  // Daily Living & Personal (Pink / Amber / Emerald)
  'Cell Phone': '#38bdf8',
  'Groceries/Food': '#eab308',
  'Eating Out': '#f59e0b',
  'Clothing/Hair': '#f472b6',
  'Health Expenses': '#10b981',
  'Misc/Entertainment': '#a855f7',

  // Income Subcategories
  'Camille Monthly Take-Home Pay': '#3b82f6',
  'Harrison Monthly Take-Home Pay': '#10b981',
  'Gross Income': '#22c55e',
  'Misc Income': '#14b8a6',
  'Camille Total Monthly Pre-Tax Income': '#8b5cf6',
  'Harrison Total Monthly Pre-Tax Income': '#06b6d4',

  // Legacy Fallbacks
  'Housing': '#3b82f6',
  'Food & Dining': '#f59e0b',
  'Utilities & Bills': '#06b6d4',
  'Entertainment': '#ec4899',
  'Transportation': '#8b5cf6',
  'Shopping': '#f97316',
  'Health & Fitness': '#10b981',
  'Miscellaneous': '#64748b',
  'TBD': '#94a3b8',
};

export const getCategoryColor = (category: Category): string => {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
};
