const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const seedDemo = require('../utils/seedDemo');
const { wrap } = require('../utils/helpers');

const sign = (id, remember) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: remember ? '30d' : '1d' });
const clean = (u) => { const o = u.toObject(); delete o.password; return o; };
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !emailRx.test(email || '') || (password || '').length < 6)
    return res.status(400).json({ message: 'Enter a name, a valid email and a password of at least 6 characters.' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: sign(user._id), user: clean(user) });
});

exports.login = wrap(async (req, res) => {
  const { email, password, remember } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password || '', user.password)))
    return res.status(401).json({ message: 'Incorrect email or password.' });
  res.json({ token: sign(user._id, remember), user: clean(user) });
});

exports.me = (req, res) => res.json({ user: clean(req.user) });

exports.updateMe = wrap(async (req, res) => {
  const allowed = ['name', 'email', 'currency', 'monthlyIncome', 'savingsTarget', 'goals', 'onboarded', 'avatar', 'dateFormat', 'theme', 'notifPrefs'];
  allowed.forEach((k) => { if (req.body[k] !== undefined) req.user[k] = req.body[k]; });
  await req.user.save();
  res.json({ user: clean(req.user) });
});

exports.changePassword = wrap(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await bcrypt.compare(currentPassword || '', user.password))) return res.status(400).json({ message: 'Current password is incorrect.' });
  if ((newPassword || '').length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated.' });
});

// Public: creates/logs into demo account with sample data
exports.demoLogin = wrap(async (req, res) => {
  let user = await User.findOne({ email: 'demo@finflow.com' });
  if (!user) user = await User.create({ name: 'Demo User', email: 'demo@finflow.com', password: await bcrypt.hash('demo1234', 10), monthlyIncome: 2000, savingsTarget: 400, currency: 'USD', onboarded: true, isDemo: true });
  await seedDemo(user._id);
  res.json({ token: sign(user._id), user: clean(user) });
});

// Protected: load sample data into the current account
exports.loadDemoData = wrap(async (req, res) => {
  await seedDemo(req.user._id);
  res.json({ message: 'Demo data loaded.' });
});