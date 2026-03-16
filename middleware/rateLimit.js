const { tooManyRequests } = require('../utils/httpError')

const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 120
const store = new Map()

function cleanup(now) {
  for (const [key, value] of store.entries()) {
    if (now - value.windowStart > WINDOW_MS) {
      store.delete(key)
    }
  }
}

function rateLimit(req, res, next) {
  const now = Date.now()
  cleanup(now)

  const key = req.ip || 'unknown'
  const existing = store.get(key)

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now })
    return next()
  }

  existing.count += 1
  if (existing.count > MAX_REQUESTS) {
    return next(tooManyRequests('Bạn gửi yêu cầu quá nhanh, vui lòng thử lại sau.', 'RATE_LIMITED'))
  }

  return next()
}

module.exports = { rateLimit }
