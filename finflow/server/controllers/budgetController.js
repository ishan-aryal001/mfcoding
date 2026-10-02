const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { wrap, monthRange, categoryTotals } = require('../utils/helpers');

exports.getAll = wrap(async (req, res) => {
  const now = new Date();
  const month = req.query.month !== undefined ? Number(req.query.month) : now.getMonth();
  const year = Number(req.query.year) || now.getFullYear();
  const budgets = await Budget.find({ userId: req.user._id, month, year }).sort({ category: 1 });
  const { start, end } = monthRange(year, month);
  const totals = await categoryTotals(Transaction, req.user._id, start, end);
  const map = Object.fromEntries(totals.map((t) => [t.category, t.total]));
  res.json(budgets.map((b) => {
    const spent = map[b.category] || 0;
    return { ...b.toObject(), spent, remaining: b.amount - spent, percent: Math.round((spent / b.amount) * 100) };
  }));
});

exports.create = wrap(async (req, res) => {
  const now = new Date();
  const { category, amount } = req.body;
  if (!category || !(Number(amount) > 0)) return res.status(400).json({ message: 'Choose a category and enter an amount.' });
  const b = await Budget.create({ userId: req.user._id, category, amount: Number(amount), month: req.body.month ?? now.getMonth(), year: req.body.year ?? now.getFullYear() });
  res.status(201).json(b);
});

exports.update = wrap(async (req, res) => {
  const { category, amount } = req.body;
  const b = await Budget.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { category, amount: Number(amount) }, { new: true, runValidators: true });
  if (!b) return res.status(404).json({ message: 'Budget not found.' });
  res.json(b);
});

exports.remove = wrap(async (req, res) => {
  const b = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!b) return res.status(404).json({ message: 'Budget not found.' });
  res.json({ message: 'Deleted' });
});