const rateLimitMap = new Map()

/**
 * Simple in-memory rate limiter
 */
function authRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 100 // max 100 requests per IP per window

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return next()
  }

  const data = rateLimitMap.get(ip)
  if (now > data.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return next()
  }

  data.count++
  if (data.count > maxRequests) {
    return res.status(429).json({
      message: 'Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau 15 phút.',
    })
  }

  next()
}

/**
 * Simple NoSQL Sanitizer
 */
function mongoSanitize(req, res, next) {
  const sanitize = (obj) => {
    if (obj instanceof Object) {
      for (const key in obj) {
        if (key.startsWith('$')) {
          delete obj[key]
        } else {
          sanitize(obj[key])
        }
      }
    }
  }

  sanitize(req.body)
  sanitize(req.params)
  sanitize(req.query)
  next()
}

module.exports = { authRateLimiter, mongoSanitize }
