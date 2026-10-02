const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized' });
    const { id } = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
};