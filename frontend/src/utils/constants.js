export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatPercent = (value) => `${Math.round(value || 0)}%`;

export const getProgressColor = (percent) => {
  if (percent >= 100) return 'bg-emerald-500';
  if (percent >= 75) return 'bg-blue-500';
  if (percent >= 50) return 'bg-indigo-500';
  if (percent >= 25) return 'bg-amber-500';
  return 'bg-rose-500';
};

export const categoryColors = {
  food: '#f59e0b',
  transport: '#3b82f6',
  rent: '#8b5cf6',
  entertainment: '#ec4899',
  health: '#10b981',
  education: '#06b6d4',
  shopping: '#f97316',
  utilities: '#64748b',
  other: '#94a3b8',
};

export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Dining', color: '#f59e0b' },
  { value: 'transport', label: 'Transport', color: '#3b82f6' },
  { value: 'rent', label: 'Rent / Housing', color: '#8b5cf6' },
  { value: 'entertainment', label: 'Entertainment', color: '#ec4899' },
  { value: 'health', label: 'Health & Fitness', color: '#10b981' },
  { value: 'education', label: 'Education', color: '#06b6d4' },
  { value: 'shopping', label: 'Shopping', color: '#f97316' },
  { value: 'utilities', label: 'Utilities', color: '#64748b' },
  { value: 'other', label: 'Other', color: '#94a3b8' },
];

export const INCOME_CATEGORIES = ['salary', 'freelance', 'business', 'investment', 'gift', 'other'];

export const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Stocks', color: '#6366f1' },
  { value: 'crypto', label: 'Cryptocurrency', color: '#f59e0b' },
  { value: 'real_estate', label: 'Real Estate', color: '#10b981' },
  { value: 'mutual_fund', label: 'Mutual Funds', color: '#3b82f6' },
  { value: 'gold', label: 'Gold', color: '#fbbf24' },
  { value: 'fd', label: 'Fixed Deposit', color: '#8b5cf6' },
  { value: 'other', label: 'Other', color: '#94a3b8' },
];
