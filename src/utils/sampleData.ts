import { Transaction, BudgetLimit } from '../types/budget';

export const DEFAULT_BUDGET_LIMITS: BudgetLimit[] = [
  // Giving & Generosity
  { category: 'Christ Covenant', limit: 800 },
  { category: 'Help the Persecuted', limit: 150 },
  { category: 'Thinking Out Loud', limit: 100 },
  { category: 'Kaula Tree', limit: 100 },
  { category: 'K-Life', limit: 100 },
  { category: 'Misc Giving/Discipleship/Generosity', limit: 150 },

  // Savings & Investments
  { category: 'Camille 401k Witholdings', limit: 600 },
  { category: 'Harrison 401k Withholdings', limit: 750 },
  { category: 'HSA Withholdings', limit: 300 },
  { category: 'Roth IRA Contribution: Camille', limit: 550 },
  { category: 'Roth IRA Contribution: Harrison', limit: 550 },
  { category: 'Personal Savings', limit: 500 },
  { category: 'Adoption Fund', limit: 400 },

  // Housing & Household
  { category: 'Mortgage Payment', limit: 1800 },
  { category: 'Utilities (Electricity/Gas/Water/Trash)', limit: 350 },
  { category: 'Internet/TV/Spotify', limit: 120 },
  { category: 'House Expenses', limit: 250 },

  // Insurance
  { category: 'Homeowners Insurance', limit: 140 },
  { category: 'Auto Insurance', limit: 180 },
  { category: 'Umbrella Policy', limit: 45 },
  { category: 'Jewlers Mutual Insurance', limit: 35 },

  // Transportation
  { category: 'Car Payment', limit: 450 },
  { category: 'Auto Gas', limit: 200 },
  { category: 'Auto Maintenance', limit: 150 },

  // Personal & Living
  { category: 'Cell Phone', limit: 110 },
  { category: 'Groceries/Food', limit: 700 },
  { category: 'Eating Out', limit: 250 },
  { category: 'Clothing/Hair', limit: 150 },
  { category: 'Health Expenses', limit: 150 },
  { category: 'Misc/Entertainment', limit: 200 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Harrison Take-Home Pay',
    amount: 5200,
    type: 'income',
    category: 'Harrison Monthly Take-Home Pay',
    date: '2026-07-01',
    note: 'Primary salary payout',
  },
  {
    id: 'tx-1b',
    title: 'Camille Take-Home Pay',
    amount: 4800,
    type: 'income',
    category: 'Camille Monthly Take-Home Pay',
    date: '2026-07-01',
    note: 'Camille monthly paycheck',
  },
  {
    id: 'tx-2',
    title: 'Monthly Mortgage Payment',
    amount: 1750,
    type: 'expense',
    category: 'Mortgage Payment',
    date: '2026-07-02',
    note: 'Escrow & principal',
  },
  {
    id: 'tx-3',
    title: 'Trader Joe\'s Grocery Haul',
    amount: 184.50,
    type: 'expense',
    category: 'Groceries/Food',
    date: '2026-07-05',
    note: 'Weekly provisions',
  },
  {
    id: 'tx-4',
    title: 'Sawnee Electric & Gas',
    amount: 142.20,
    type: 'expense',
    category: 'Utilities (Electricity/Gas/Water/Trash)',
    date: '2026-07-08',
    note: 'Summer air conditioning',
  },
  {
    id: 'tx-5',
    title: 'Christ Covenant Tithe',
    amount: 800,
    type: 'expense',
    category: 'Christ Covenant',
    date: '2026-07-10',
    note: 'Monthly contribution',
  },
  {
    id: 'tx-6',
    title: 'Comcast Fiber Internet & Spotify',
    amount: 89.99,
    type: 'expense',
    category: 'Internet/TV/Spotify',
    date: '2026-07-12',
    note: 'Gigabit fiber & family streaming',
  },
  {
    id: 'tx-7',
    title: 'Dinner at Italian Bistro',
    amount: 78.40,
    type: 'expense',
    category: 'Eating Out',
    date: '2026-07-15',
    note: 'Weekend dining',
  },
  {
    id: 'tx-8',
    title: 'Chevron Auto Gas Fill-Up',
    amount: 54.00,
    type: 'expense',
    category: 'Auto Gas',
    date: '2026-07-18',
    note: 'Premium unleaded',
  },
  {
    id: 'tx-9',
    title: 'Adoption Fund Contribution',
    amount: 400,
    type: 'expense',
    category: 'Adoption Fund',
    date: '2026-07-20',
    note: 'Monthly savings goal',
  },
  {
    id: 'tx-10',
    title: 'Roth IRA Contribution Harrison',
    amount: 550,
    type: 'expense',
    category: 'Roth IRA Contribution: Harrison',
    date: '2026-07-22',
    note: 'Automatic index fund transfer',
  },
];
