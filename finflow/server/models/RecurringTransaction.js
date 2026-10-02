const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: ['income', 'expense'], default: 'expense' },
  category: { type: String, required: true },
  frequency: { type: String, enum: ['weekly', 'monthly', 'yearly'], required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  nextDate: { type: Date, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
module.exports = mongoose.model('RecurringTransaction', schema);