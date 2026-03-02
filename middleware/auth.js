const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * Xác thực JWT, gắn req.user (id, role). Dùng cho route cần đăng nhập.
 */
function auth(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Chưa đăng nhập' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    req.role = decoded.role
    next()
  } catch {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

/**
 * Chỉ cho phép role chỉ định (vd: 'recruiter' hoặc 'student').
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' })
    }
    next()
  }
}

module.exports = { auth, requireRole }
