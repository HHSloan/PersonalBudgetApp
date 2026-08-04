export type TransactionType = 'income' | 'expense';

export type Category =
  // Giving & Generosity
  | 'Christ Covenant'
  | 'Help the Persecuted'
  | 'Thinking Out Loud'
  | 'Kaula Tree'
  | 'K-Life'
  | 'Misc Giving/Discipleship/Generosity'
  // Savings & Investments
  | 'Camille 401k Witholdings'
  | 'Harrison 401k Withholdings'
  | 'HSA Withholdings'
  | 'Roth IRA Contribution: Camille'
  | 'Roth IRA Contribution: Harrison'
  | 'Personal Savings'
  | 'Adoption Fund'
  // Housing & Living
  | 'Mortgage Payment'
  | 'Utilities (Electricity/Gas/Water/Trash)'
  | 'Internet/TV/Spotify'
  | 'House Expenses'
  // Insurance
  | 'Homeowners Insurance'
  | 'Auto Insurance'
  | 'Umbrella Policy'
  | 'Jewlers Mutual Insurance'
  // Vehicle & Transportation
  | 'Car Payment'
  | 'Auto Gas'
  | 'Auto Maintenance'
  // Daily Living & Personal
  | 'Cell Phone'
  | 'Groceries/Food'
  | 'Eating Out'
  | 'Clothing/Hair'
  | 'Health Expenses'
  | 'Misc/Entertainment'
  // Legacy / Fallbacks
  | 'Housing'
  | 'Food & Dining'
  | 'Utilities & Bills'
  | 'Entertainment'
  | 'Transportation'
  | 'Shopping'
  | 'Health & Fitness'
  | 'Miscellaneous'
  // Income Subcategories
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
