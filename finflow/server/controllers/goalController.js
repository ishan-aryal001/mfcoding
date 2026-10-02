const Goal = require("../models/Goal");
const { wrap } = require("../utils/helpers");

const withMeta = (g) => {
  const o = g.toObject();
  o.percent = Math.min(
    100,
    Math.round((o.currentAmount / o.targetAmount) * 100),
  );
  const left = Math.max(0, o.targetAmount - o.currentAmount);
  if (o.deadline && left > 0) {
    const months = Math.max(
      1,
      (new Date(o.deadline) - new Date()) / (30.44 * 86400000),
    );
    o.monthlyNeeded = Math.ceil(left / months);
  } else o.monthlyNeeded = 0;
  return o;
};

exports.getAll = wrap(async (req, res) =>
  res.json(
    (await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 })).map(
      withMeta,
    ),
  ),
);

exports.create = wrap(async (req, res) => {
  const { name, targetAmount, currentAmount, deadline, category } = req.body;
  if (!name?.trim() || !(Number(targetAmount) > 0))
    return res
      .status(400)
      .json({ message: "Enter a goal name and a target amount." });
  const g = await Goal.create({
    userId: req.user._id,
    name,
    targetAmount: Number(targetAmount),
    currentAmount: Number(currentAmount) || 0,
    deadline: deadline || undefined,
    category,
  });
  res.status(201).json(withMeta(g));
});

exports.update = wrap(async (req, res) => {
  const { name, targetAmount, currentAmount, deadline, category } = req.body;
  const g = await Goal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    {
      name,
      targetAmount,
      currentAmount,
      deadline: deadline || undefined,
      category,
    },
    { new: true, runValidators: true },
  );
  if (!g) return res.status(404).json({ message: "Goal not found." });
  res.json(withMeta(g));
});

// POST /api/goals/:id/funds  { amount, action: 'add' | 'withdraw' }
exports.funds = wrap(async (req, res) => {
  const amt = Number(req.body.amount);
  if (!(amt > 0))
    return res.status(400).json({ message: "Enter a valid amount." });
  const g = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
  if (!g) return res.status(404).json({ message: "Goal not found." });
  if (req.body.action === "withdraw") {
    if (amt > g.currentAmount)
      return res
        .status(400)
        .json({ message: "You can't withdraw more than you've saved." });
    g.currentAmount -= amt;
  } else g.currentAmount += amt;
  await g.save();
  res.json(withMeta(g));
});

exports.remove = wrap(async (req, res) => {
  const g = await Goal.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!g) return res.status(404).json({ message: "Goal not found." });
  res.json({ message: "Deleted" });
});
