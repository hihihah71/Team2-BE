function accessLog(req, res, next) {
  const startedAt = Date.now()
  res.on('finish', () => {
    const elapsed = Date.now() - startedAt
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${elapsed}ms requestId=${req.requestId}`,
    )
  })
  next()
}

module.exports = { accessLog }
