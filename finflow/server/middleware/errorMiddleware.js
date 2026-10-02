exports.notFound = (req, res) => res.status(404).json({ message: 'Route not found' });

exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors)[0].message });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID' });
  if (err.code === 11000) return res.status(409).json({ message: 'That record already exists' });
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong. Please try again.' });
};