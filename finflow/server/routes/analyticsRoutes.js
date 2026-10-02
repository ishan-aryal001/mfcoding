const r = require('express').Router();
const c = require('../controllers/analyticsController');
const protect = require('../middleware/authMiddleware');
r.use(protect);
r.get('/overview', c.overview);
r.get('/monthly', c.monthly);
r.get('/categories', c.categories);
r.get('/insights', c.insights);
module.exports = r;