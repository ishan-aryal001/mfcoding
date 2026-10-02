const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const processRecurring = require('../utils/recurring');
const { wrap, oid, monthRange, prevMonth, pct, sumRange, categoryTotals } = require('../utils/helpers');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

exports.overview = wrap(async (req, res) => {
  const uid = req.user._id;
  await processRecurring(uid);
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const cur = monthRange(y, m);
  const p = prevMonth(y, m);
  const prev = monthRange(p.y, p.m);

  const [income, expenses, pIncome, pExpenses, allIn, allEx, recent, cats] = await Promise.all([
    sumRange(Transaction, uid, 'income', cur.start, cur.end),
    sumRange(Transaction, uid, 'expense', cur.start, cur.end),
    sumRange(Transaction, uid, 'income', prev.start, prev.end),
    sumRange(Transaction, uid, 'expense', prev.start, prev.end),
    sumRange(Transaction, uid, 'income', new Date(0), new Date(9999, 0)),
    sumRange(Transaction, uid, 'expense', new Date(0), new Date(9999, 0)),
    Transaction.find({ userId: uid }).sort({ date: -1 }).limit(6),
    categoryTotals(Transaction, uid, cur.start, cur.end),
  ]);

  const budgets = await Budget.find({ userId: uid, month: m, year: y });
  const spentMap = Object.fromEntries(cats.map((c) => [c.category, c.total]));
  const budgetList = budgets.map((b) => ({ _id: b._id, category: b.category, amount: b.amount, spent: spentMap[b.category] || 0, percent: Math.round(((spentMap[b.category] || 0) / b.amount) * 100) }));

  const savings = income - expenses;
  const pSavings = pIncome - pExpenses;
  res.json({
    month: MONTHS[m], year: y,
    balance: allIn - allEx,
    income, expenses, savings,
    changes: { income: pct(income, pIncome), expenses: pct(expenses, pExpenses), savings: pct(savings, pSavings) },
    recent, categories: cats, budgets: budgetList,
  });
});

exports.monthly = wrap(async (req, res) => {
  const n = Math.min(24, Number(req.query.months) || 6);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (n - 1), 1);
  const rows = await Transaction.aggregate([
    { $match: { userId: oid(req.user._id), date: { $gte: start } } },
    { $group: { _id: { y: { $year: '$date' }, m: { $month: '$date' }, t: '$type' }, total: { $sum: '$amount' } } },
  ]);
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const find = (t) => rows.find((r) => r._id.y === d.getFullYear() && r._id.m === d.getMonth() + 1 && r._id.t === t)?.total || 0;
    out.push({ label: MONTHS[d.getMonth()], income: find('income'), expense: find('expense') });
  }
  res.json(out);
});

exports.categories = wrap(async (req, res) => {
  const now = new Date();
  const y = Number(req.query.year) || now.getFullYear();
  const m = req.query.month !== undefined ? Number(req.query.month) : now.getMonth();
  const { start, end } = monthRange(y, m);
  const p = prevMonth(y, m);
  const pr = monthRange(p.y, p.m);
  const [cur, prev] = await Promise.all([categoryTotals(Transaction, req.user._id, start, end), categoryTotals(Transaction, req.user._id, pr.start, pr.end)]);
  const pm = Object.fromEntries(prev.map((x) => [x.category, x.total]));
  const total = cur.reduce((s, x) => s + x.total, 0);
  res.json(cur.map((c) => ({ ...c, share: total ? Math.round((c.total / total) * 100) : 0, change: pct(c.total, pm[c.category] || 0), previous: pm[c.category] || 0 })));
});

exports.insights = wrap(async (req, res) => {
  const uid = req.user._id;
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const cur = monthRange(y, m);
  const p = prevMonth(y, m);
  const prev = monthRange(p.y, p.m);
  const [inc, exp, pExp, cats, pCats, budgets] = await Promise.all([
    sumRange(Transaction, uid, 'income', cur.start, cur.end),
    sumRange(Transaction, uid, 'expense', cur.start, cur.end),
    sumRange(Transaction, uid, 'expense', prev.start, prev.end),
    categoryTotals(Transaction, uid, cur.start, cur.end),
    categoryTotals(Transaction, uid, prev.start, prev.end),
    Budget.find({ userId: uid, month: m, year: y }),
  ]);
  const out = [];
  const add = (type, icon, text) => out.push({ type, icon, text }); // type: good | warn | info
  if (pExp > 0) {
    const c = pct(exp, pExp);
    add(c > 0 ? 'warn' : 'good', c > 0 ? 'trending-up' : 'trending-down', `Your spending ${c > 0 ? 'increased' : 'decreased'} by ${Math.abs(c)}% compared to last month.`);
  }
  if (cats[0]) add('info', 'pie-chart', `You spent the most on ${cats[0].category} this month.`);
  const spentMap = Object.fromEntries(cats.map((c) => [c.category, c.total]));
  budgets.forEach((b) => {
    const pc = Math.round(((spentMap[b.category] || 0) / b.amount) * 100);
    if (pc > 100) add('warn', 'alert-triangle', `You've exceeded your ${b.category} budget by ${pc - 100}%.`);
    else if (pc >= 70) add('warn', 'gauge', `You have used ${pc}% of your ${b.category} budget.`);
  });
  if (inc > 0) {
    const s = Math.round(((inc - exp) / inc) * 100);
    add(s >= 15 ? 'good' : s >= 0 ? 'info' : 'warn', 'piggy-bank', s >= 0 ? `You saved ${s}% of your income this month.` : `You spent ${Math.abs(s)}% more than you earned this month.`);
  }
  const pm = Object.fromEntries(pCats.map((x) => [x.category, x.total]));
  cats.forEach((c) => {
    if (pm[c.category]) {
      const ch = pct(c.total, pm[c.category]);
      if (ch <= -10) add('good', 'trending-down', `You are spending less on ${c.category} than last month (${Math.abs(ch)}% lower).`);
      else if (ch >= 15) add('warn', 'trending-up', `Your ${c.category.toLowerCase()} spending is ${ch}% higher than last month.`);
    }
  });
  res.json(out);
});