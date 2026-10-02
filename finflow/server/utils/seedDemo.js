const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Recurring = require('../models/RecurringTransaction');
const Notification = require('../models/Notification');

module.exports = async (userId) => {
  await Promise.all([Transaction, Budget, Goal, Recurring, Notification].map((M) => M.deleteMany({ userId })));
  const now = new Date();
  const d = (monthsAgo, day) => new Date(now.getFullYear(), now.getMonth() - monthsAgo, day, 12);
  const tx = [];
  const pm = ['Cash', 'Bank', 'Credit Card', 'Debit Card', 'Digital Wallet'];
  const expSamples = [
    ['Food', "McDonald's", 12.5], ['Food', 'Groceries', 64], ['Food', 'Coffee shop', 6.8], ['Food', 'Pizza night', 22],
    ['Transport', 'Uber ride', 14], ['Transport', 'Bus pass', 30], ['Shopping', 'New sneakers', 70],
    ['Entertainment', 'Cinema', 18], ['Entertainment', 'Spotify', 10], ['Bills', 'Internet', 35],
    ['Bills', 'Phone plan', 20], ['Education', 'Online course', 25], ['Health', 'Pharmacy', 15],
  ];
  for (let m = 5; m >= 0; m--) {
    tx.push({ type: 'income', amount: 1500, category: 'Salary', description: 'Salary', date: d(m, 1), paymentMethod: 'Bank' });
    tx.push({ type: 'income', amount: 400 + (m % 3) * 50, category: 'Freelance', description: 'Freelance project', date: d(m, 12), paymentMethod: 'Digital Wallet' });
    expSamples.forEach(([category, description, base], i) => {
      const day = Math.min(27, 2 + i * 2);
      if (m === 0 && day > now.getDate()) return;
      tx.push({ type: 'expense', category, description, amount: +(base * (0.85 + ((i + m) % 4) * 0.1)).toFixed(2), date: d(m, day), paymentMethod: pm[(i + m) % 5] });
    });
  }
  await Transaction.insertMany(tx.map((t) => ({ ...t, userId })));
  const month = now.getMonth(), year = now.getFullYear();
  await Budget.insertMany([['Food', 200], ['Transport', 60], ['Entertainment', 25], ['Shopping', 100], ['Bills', 80]].map(([category, amount]) => ({ userId, category, amount, month, year })));
  await Goal.insertMany([
    { userId, name: 'New Laptop', targetAmount: 1500, currentAmount: 850, deadline: new Date(year, 11, 30), category: 'Electronics' },
    { userId, name: 'Emergency Fund', targetAmount: 3000, currentAmount: 1200, deadline: new Date(year + 1, 5, 30), category: 'Emergency' },
    { userId, name: 'Vacation', targetAmount: 1000, currentAmount: 250, deadline: new Date(year + 1, 2, 15), category: 'Travel' },
  ]);
  await Recurring.insertMany([
    { userId, name: 'Netflix', amount: 12, type: 'expense', category: 'Entertainment', frequency: 'monthly', nextDate: new Date(now.getTime() + 86400000) },
    { userId, name: 'Rent', amount: 450, type: 'expense', category: 'Bills', frequency: 'monthly', nextDate: new Date(year, month + 1, 1) },
    { userId, name: 'Gym membership', amount: 25, type: 'expense', category: 'Health', frequency: 'monthly', nextDate: new Date(year, month, now.getDate() + 5) },
    { userId, name: 'Salary', amount: 1500, type: 'income', category: 'Salary', frequency: 'monthly', nextDate: new Date(year, month + 1, 1) },
  ]);
};