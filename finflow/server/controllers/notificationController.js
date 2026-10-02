const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Recurring = require('../models/RecurringTransaction');
const { wrap, monthRange, prevMonth, sumRange, categoryTotals } = require('../utils/helpers');

// Creates new notifications (deduped by key) from current data
const sync = async (user) => {
  const uid = user._id, prefs = user.notifPrefs || {};
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), tag = `${y}-${m}`;
  const make = async (key, type, title, message) => {
    if (await Notification.exists({ userId: uid, key })) return;
    await Notification.create({ userId: uid, key, type, title, message });
  };
  const { start, end } = monthRange(y, m);
  if (prefs.budget !== false) {
    const [budgets, cats] = await Promise.all([Budget.find({ userId: uid, month: m, year: y }), categoryTotals(Transaction, uid, start, end)]);
    const map = Object.fromEntries(cats.map((c) => [c.category, c.total]));
    for (const b of budgets) {
      const pc = Math.round(((map[b.category] || 0) / b.amount) * 100);
      if (pc > 100) await make(`b100-${b.category}-${tag}`, 'budget', 'Budget exceeded', `You've exceeded your ${b.category} budget.`);
      else if (pc >= 90) await make(`b90-${b.category}-${tag}`, 'budget', 'Budget almost used', `You have used ${pc}% of your ${b.category} budget.`);
    }
  }
  if (prefs.recurring !== false) {
    const soon = new Date(now.getTime() + 2 * 86400000);
    const items = await Recurring.find({ userId: uid, type: 'expense', nextDate: { $gte: now, $lte: soon } });
    for (const r of items) await make(`r-${r._id}-${r.nextDate.toISOString().slice(0, 10)}`, 'recurring', 'Payment due soon', `Your ${r.name} payment is due ${r.nextDate.toDateString() === new Date(now.getTime() + 86400000).toDateString() ? 'tomorrow' : 'soon'}.`);
  }
  if (prefs.goals !== false) {
    for (const g of await Goal.find({ userId: uid })) {
      const left = g.targetAmount - g.currentAmount;
      if (left <= 0) await make(`g-done-${g._id}`, 'goal', 'Goal reached 🎉', `You reached your "${g.name}" goal!`);
      else if (left <= g.targetAmount * 0.1) await make(`g-near-${g._id}`, 'goal', 'Almost there', `You are $${Math.round(left)} away from your "${g.name}" goal.`);
    }
  }
  if (prefs.spending !== false) {
    const p = prevMonth(y, m), pr = monthRange(p.y, p.m);
    const [cur, prev] = await Promise.all([sumRange(Transaction, uid, 'expense', start, end), sumRange(Transaction, uid, 'expense', pr.start, pr.end)]);
    if (prev > 0 && cur > prev) await make(`s-${tag}`, 'spending', 'Spending alert', 'Your expenses are higher than last month.');
  }
};

exports.getAll = wrap(async (req, res) => {
  await sync(req.user);
  const items = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30);
  res.json({ items, unread: items.filter((n) => !n.read).length });
});

exports.markRead = wrap(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true }, { new: true });
  if (!n) return res.status(404).json({ message: 'Notification not found.' });
  res.json(n);
});

exports.markAllRead = wrap(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ message: 'All marked as read' });
});