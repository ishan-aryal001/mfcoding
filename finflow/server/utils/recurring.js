const Recurring = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const { addFreq } = require('./helpers');

// Creates transactions for any recurring item whose nextDate has passed
module.exports = async (userId) => {
  const now = new Date();
  const due = await Recurring.find({ userId, nextDate: { $lte: now } });
  for (const r of due) {
    let guard = 0;
    while (r.nextDate <= now && guard++ < 24) {
      if (r.endDate && r.nextDate > r.endDate) break;
      await Transaction.create({
        userId, type: r.type, amount: r.amount, category: r.category,
        description: r.name, paymentMethod: 'Bank', date: r.nextDate, note: 'Recurring',
      });
      r.nextDate = addFreq(r.nextDate, r.frequency);
    }
    await r.save();
  }
};