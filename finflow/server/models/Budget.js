const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
schema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });
module.exports = mongoose.model('Budget', schema);