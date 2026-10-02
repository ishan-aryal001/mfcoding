const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['budget', 'recurring', 'goal', 'spending', 'info'], default: 'info' },
  read: { type: Boolean, default: false },
  key: { type: String, index: true }, // dedupe key
}, { timestamps: { createdAt: true, updatedAt: false } });
module.exports = mongoose.model('Notification', schema);