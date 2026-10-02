const Recurring = require('../models/RecurringTransaction');
const processRecurring = require('../utils/recurring');
const { wrap } = require('../utils/helpers');

exports.getAll = wrap(async (req, res) => {
  await processRecurring(req.user._id);
  res.json(await Recurring.find({ userId: req.user._id }).sort({ nextDate: 1 }));
});

exports.create = wrap(async (req, res) => {
  const { name, amount, type, category, frequency, startDate, endDate } = req.body;
  if (!name?.trim() || !(Number(amount) > 0) || !category || !frequency) return res.status(400).json({ message: 'Fill in name, amount, category and frequency.' });
  const start = startDate ? new Date(startDate) : new Date();
  const r = await Recurring.create({ userId: req.user._id, name, amount: Number(amount), type: type || 'expense', category, frequency, startDate: start, nextDate: start, endDate: endDate || undefined });
  await processRecurring(req.user._id); // creates past-due entries if start date is in the past
  res.status(201).json(await Recurring.findById(r._id));
});

exports.update = wrap(async (req, res) => {
  const { name, amount, type, category, frequency, nextDate, endDate } = req.body;
  const r = await Recurring.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { name, amount, type, category, frequency, nextDate, endDate: endDate || undefined }, { new: true, runValidators: true });
  if (!r) return res.status(404).json({ message: 'Recurring item not found.' });
  res.json(r);
});

exports.remove = wrap(async (req, res) => {
  const r = await Recurring.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!r) return res.status(404).json({ message: 'Recurring item not found.' });
  res.json({ message: 'Deleted' });
});