const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true, min: 1 },
  currentAmount: { type: Number, default: 0, min: 0 },
  deadline: { type: Date },
  category: { type: String, default: 'General' },
}, { timestamps: { createdAt: true, updatedAt: false } });
module.exports = mongoose.model('Goal', schema);