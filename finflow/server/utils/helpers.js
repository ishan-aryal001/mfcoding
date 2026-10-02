const mongoose = require('mongoose');
exports.oid = (id) => new mongoose.Types.ObjectId(id);
exports.monthRange = (y, m) => ({ start: new Date(y, m, 1), end: new Date(y, m + 1, 1) }); // m: 0-11
exports.prevMonth = (y, m) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 });
exports.pct = (cur, prev) => (prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100));
exports.addFreq = (d, f) => {
  const n = new Date(d);
  if (f === 'weekly') n.setDate(n.getDate() + 7);
  else if (f === 'monthly') n.setMonth(n.getMonth() + 1);
  else n.setFullYear(n.getFullYear() + 1);
  return n;
};
exports.wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// sum of transactions of a type in a date range
exports.sumRange = async (Transaction, userId, type, start, end) => {
  const r = await Transaction.aggregate([
    { $match: { userId: exports.oid(userId), type, date: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return r[0]?.total || 0;
};

exports.categoryTotals = async (Transaction, userId, start, end) => {
  const r = await Transaction.aggregate([
    { $match: { userId: exports.oid(userId), type: 'expense', date: { $gte: start, $lt: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);
  return r.map((x) => ({ category: x._id, total: x.total, count: x.count }));
};