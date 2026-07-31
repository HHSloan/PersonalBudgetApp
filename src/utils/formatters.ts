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

export const CATEGORIES: Category[] = [
  'Housing',
  'Food & Dining',
  'Utilities & Bills',
  'Entertainment',
  'Transportation',
  'Shopping',
  'Health & Fitness',
  'Income',
  'Investments',
  'Miscellaneous',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  'Housing': '#3b82f6', // blue
  'Food & Dining': '#f59e0b', // amber
  'Utilities & Bills': '#06b6d4', // cyan
  'Entertainment': '#ec4899', // pink
  'Transportation': '#8b5cf6', // purple
  'Shopping': '#f97316', // orange
  'Health & Fitness': '#10b981', // emerald
  'Income': '#22c55e', // green
  'Investments': '#14b8a6', // teal
  'Miscellaneous': '#64748b', // slate
};
