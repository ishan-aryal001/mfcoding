const r = require('express').Router();
const c = require('../controllers/goalController');
const protect = require('../middleware/authMiddleware');
r.use(protect);
r.route('/').get(c.getAll).post(c.create);
r.post('/:id/funds', c.funds);
r.route('/:id').put(c.update).delete(c.remove);
module.exports = r;