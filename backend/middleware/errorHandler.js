export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message = statusCode >= 500 && isProduction ? 'Server error' : (err.message || 'Server error');

  res.status(statusCode).json({
    message,
    stack: isProduction ? null : err.stack,
  });
};
