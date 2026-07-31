import { Transaction, BudgetLimit, ThemeMode } from '../types/budget';
import { INITIAL_TRANSACTIONS, DEFAULT_BUDGET_LIMITS } from './sampleData';

const TRANSACTIONS_KEY = 'personal_budget_app_transactions_v1';
const BUDGET_LIMITS_KEY = 'personal_budget_app_limits_v1';
const THEME_KEY = 'personal_budget_app_theme_v1';

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading transactions from localStorage', e);
  }
  // Save default sample data on initial load
  saveTransactions(INITIAL_TRANSACTIONS);
  return INITIAL_TRANSACTIONS;
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions to localStorage', e);
  }
};

export const loadBudgetLimits = (): BudgetLimit[] => {
  try {
    const data = localStorage.getItem(BUDGET_LIMITS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading budget limits from localStorage', e);
  }
  saveBudgetLimits(DEFAULT_BUDGET_LIMITS);
  return DEFAULT_BUDGET_LIMITS;
};

export const saveBudgetLimits = (limits: BudgetLimit[]): void => {
  try {
    localStorage.setItem(BUDGET_LIMITS_KEY, JSON.stringify(limits));
  } catch (e) {
    console.error('Error saving budget limits to localStorage', e);
  }
};

export const loadTheme = (): ThemeMode => {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'light' || theme === 'dark') {
      return theme;
    }
  } catch (e) {
    console.error('Error loading theme', e);
  }
  return 'dark';
};

export const saveTheme = (theme: ThemeMode): void => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Error saving theme', e);
  }
};

export const resetToDefaultData = (): { transactions: Transaction[]; budgetLimits: BudgetLimit[] } => {
  saveTransactions(INITIAL_TRANSACTIONS);
  saveBudgetLimits(DEFAULT_BUDGET_LIMITS);
  return { transactions: INITIAL_TRANSACTIONS, budgetLimits: DEFAULT_BUDGET_LIMITS };
};
