const Transaction = require('../models/Transaction');
const { wrap } = require('../utils/helpers');

const validate = (b) => {
  if (!['income', 'expense'].includes(b.type)) return 'Choose income or expense.';
  if (!(Number(b.amount) > 0)) return 'Enter a valid amount.';
  if (!b.category) return 'Choose a category.';
  if (!b.description?.trim()) return 'Add a description.';
  return null;
};

exports.getAll = wrap(async (req, res) => {
  const { type, category, paymentMethod, search, range, from, to, sort = 'newest', page = 1, limit = 50 } = req.query;
  const q = { userId: req.user._id };
  if (type) q.type = type;
  if (category) q.category = category;
  if (paymentMethod) q.paymentMethod = paymentMethod;
  if (search) q.description = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  const now = new Date();
  const sod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === 'today') q.date = { $gte: sod, $lt: new Date(sod.getTime() + 86400000) };
  else if (range === 'week') { const s = new Date(sod); s.setDate(s.getDate() - s.getDay()); q.date = { $gte: s }; }
  else if (range === 'month') q.date = { $gte: new Date(now.getFullYear(), now.getMonth(), 1), $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
  else if (range === 'lastMonth') q.date = { $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1), $lt: new Date(now.getFullYear(), now.getMonth(), 1) };
  else if (range === 'custom' && from && to) q.date = { $gte: new Date(from), $lte: new Date(new Date(to).getTime() + 86399999) };
  const sorts = { newest: { date: -1 }, oldest: { date: 1 }, highest: { amount: -1 }, lowest: { amount: 1 } };
  const [items, total] = await Promise.all([
    Transaction.find(q).sort(sorts[sort] || sorts.newest).skip((page - 1) * limit).limit(Number(limit)),
    Transaction.countDocuments(q),
  ]);
  res.json({ items, total });
});

exports.create = wrap(async (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });
  const { type, amount, category, description, paymentMethod, date, note } = req.body;
  const t = await Transaction.create({ userId: req.user._id, type, amount: Number(amount), category, description, paymentMethod, date: date || Date.now(), note });
  res.status(201).json(t);
});

exports.update = wrap(async (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });
  const { type, amount, category, description, paymentMethod, date, note } = req.body;
  const t = await Transaction.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { type, amount: Number(amount), category, description, paymentMethod, date, note }, { new: true, runValidators: true });
  if (!t) return res.status(404).json({ message: 'Transaction not found.' });
  res.json(t);
});

exports.remove = wrap(async (req, res) => {
  const t = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!t) return res.status(404).json({ message: 'Transaction not found.' });
  res.json({ message: 'Deleted' });
});