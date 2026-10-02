const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  paymentMethod: { type: String, enum: ['Cash', 'Bank', 'Credit Card', 'Debit Card', 'Digital Wallet'], default: 'Cash' },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' },
}, { timestamps: { createdAt: true, updatedAt: false } });
schema.index({ userId: 1, date: -1 });
module.exports = mongoose.model('Transaction', schema);