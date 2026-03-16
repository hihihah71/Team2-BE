const crypto = require('crypto')

function requestId(req, res, next) {
  req.requestId = crypto.randomUUID()
  res.setHeader('x-request-id', req.requestId)
  next()
}

module.exports = { requestId }
