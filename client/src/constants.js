js
import { Utensils, Car, ShoppingBag, Film, GraduationCap, Receipt, HeartPulse, Plane, MoreHorizontal, Briefcase, Laptop, Building2, Gift, TrendingUp } from 'lucide-react';

export const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Education', 'Bills', 'Health', 'Travel', 'Other'];
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Gift', 'Investment', 'Other'];
export const PAYMENT_METHODS = ['Cash', 'Bank', 'Credit Card', 'Debit Card', 'Digital Wallet'];
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'NPR', 'AUD', 'CAD'];
export const GOAL_CATEGORIES = ['General', 'Electronics', 'Emergency', 'Travel', 'Education', 'Home', 'Other'];

const CAT = {
  Food: { icon: Utensils, color: '#10b981' },
  Transport: { icon: Car, color: '#3b82f6' },
  Shopping: { icon: ShoppingBag, color: '#a855f7' },
  Entertainment: { icon: Film, color: '#f97316' },
  Education: { icon: GraduationCap, color: '#6366f1' },
  Bills: { icon: Receipt, color: '#64748b' },
  Health: { icon: HeartPulse, color: '#ec4899' },
  Travel: { icon: Plane, color: '#06b6d4' },
  Other: { icon: MoreHorizontal, color: '#94a3b8' },
  Salary: { icon: Briefcase, color: '#10b981' },
  Freelance: { icon: Laptop, color: '#14b8a6' },
  Business: { icon: Building2, color: '#0ea5e9' },
  Gift: { icon: Gift, color: '#f59e0b' },
  Investment: { icon: TrendingUp, color: '#8b5cf6' },
};
export const catMeta = (c) => CAT[c] || CAT.Other;

// Budget colour states: 0-70 normal, 70-90 warning, 90-100 danger, >100 exceeded
export const budgetState = (p) =>
  p > 100 ? { label: 'Exceeded', bar: 'bg-red-500', text: 'text-red-500' }
  : p >= 90 ? { label: 'Danger', bar: 'bg-orange-500', text: 'text-orange-500' }
  : p >= 70 ? { label: 'Warning', bar: 'bg-amber-400', text: 'text-amber-500' }
  : { label: 'On track', bar: 'bg-emerald-500', text: 'text-emerald-500' };
