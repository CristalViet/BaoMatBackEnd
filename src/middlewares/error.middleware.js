function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.status || 500;
  return res.status(status).json({
    message: error.message || "Internal server error",
    details: error.details || undefined,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
