const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  currency: { type: String, default: 'USD' },
  monthlyIncome: { type: Number, default: 0 },
  savingsTarget: { type: Number, default: 0 },
  goals: [String],
  onboarded: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  dateFormat: { type: String, default: 'MMM DD' },
  theme: { type: String, default: 'light' },
  notifPrefs: {
    budget: { type: Boolean, default: true },
    recurring: { type: Boolean, default: true },
    goals: { type: Boolean, default: true },
    spending: { type: Boolean, default: true },
  },
  isDemo: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });
module.exports = mongoose.model('User', schema);