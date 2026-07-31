export const DEFAULT_TRANSACTIONS = [
  {
    id: 'tx-1',
    date: '2026-07-28',
    description: 'Bi-weekly Salary Deposit',
    category: 'Income',
    type: 'income',
    amount: 3450.00,
    notes: 'Direct deposit from main employer'
  },
  {
    id: 'tx-2',
    date: '2026-07-29',
    description: 'Apartment Rent & Water',
    category: 'Housing',
    type: 'expense',
    amount: 1450.00,
    notes: 'Monthly rent payment'
  },
  {
    id: 'tx-3',
    date: '2026-07-30',
    description: 'Whole Foods Market',
    category: 'Groceries',
    type: 'expense',
    amount: 184.25,
    notes: 'Weekly organic groceries'
  },
  {
    id: 'tx-4',
    date: '2026-07-30',
    description: 'High-Yield Savings Transfer',
    category: 'Savings',
    type: 'savings',
    amount: 500.00,
    notes: 'Automated transfer to HYSA'
  },
  {
    id: 'tx-5',
    date: '2026-07-31',
    description: 'Chevron Gas Station',
    category: 'Transportation',
    type: 'expense',
    amount: 48.50,
    notes: 'Full tank refuel'
  },
  {
    id: 'tx-6',
    date: '2026-07-31',
    description: 'Freelance Design Consultation',
    category: 'Side Income',
    type: 'income',
    amount: 750.00,
    notes: 'Web redesign milestone'
  },
  {
    id: 'tx-7',
    date: '2026-07-25',
    description: 'Electric & Fiber Internet',
    category: 'Utilities',
    type: 'expense',
    amount: 142.00,
    notes: 'Electric bill + AT&T fiber'
  },
  {
    id: 'tx-8',
    date: '2026-07-26',
    description: 'Sushi Dinner with Friends',
    category: 'Dining Out',
    type: 'expense',
    amount: 92.40,
    notes: 'Dinner at Omakase'
  }
];

export const DEFAULT_BUDGET_LIMITS = {
  Housing: 1500,
  Groceries: 600,
  DiningOut: 300,
  Transportation: 250,
  Utilities: 200,
  Entertainment: 200,
  Shopping: 250
};

export const DEFAULT_SAVINGS_GOALS = [
  {
    id: 'goal-1',
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 6450,
    targetDate: '2026-12-31',
    color: '#10b981'
  },
  {
    id: 'goal-2',
    name: 'Summer Japan Trip',
    targetAmount: 4500,
    currentAmount: 2800,
    targetDate: '2027-05-15',
    color: '#a855f7'
  },
  {
    id: 'goal-3',
    name: 'New EV Down Payment',
    targetAmount: 8000,
    currentAmount: 3200,
    targetDate: '2027-01-30',
    color: '#06b6d4'
  }
];
