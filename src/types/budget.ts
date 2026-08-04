export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Housing'
  | 'Food & Dining'
  | 'Utilities & Bills'
  | 'Entertainment'
  | 'Transportation'
  | 'Shopping'
  | 'Health & Fitness'
  | 'Income'
  | 'Investments'
  | 'Miscellaneous'
  | 'Camille Total Monthly Pre-Tax Income'
  | 'Harrison Total Monthly Pre-Tax Income'
  | 'Gross Income'
  | 'Misc Income'
  | 'Camille Monthly Take-Home Pay'
  | 'Harrison Monthly Take-Home Pay';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // ISO YYYY-MM-DD
  note?: string;
}

export interface BudgetLimit {
  category: Category;
  limit: number;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'budgets' | 'analytics';

export type ThemeMode = 'dark' | 'light';

export interface FilterOptions {
  searchQuery: string;
  category: string; // 'all' or Category
  type: string; // 'all' | 'income' | 'expense'
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface CategorySummary {
  category: Category;
  spent: number;
  limit: number;
  percentage: number;
}
