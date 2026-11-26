export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  console.error(`[ERROR ${status}] ${req.method} ${req.originalUrl}:`, err.message);
  res.status(status).json({
    error: true,
    message: err.message || 'Lỗi máy chủ nội bộ',
  });
}
