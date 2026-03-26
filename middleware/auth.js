const jwt = require('jsonwebtoken')
const { unauthorized, forbidden } = require('../utils/httpError')
const userRepository = require('../repositories/user.repository')

/**
 * Xác thực JWT, gắn req.user (id, role). Dùng cho route cần đăng nhập.
 */
async function auth(req, res, next) {
  const authHeader = req.headers.authorization
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const tokenFromQuery = typeof req.query.token === 'string' ? req.query.token : null
  const token = tokenFromHeader || tokenFromQuery

  if (!token) {
    return next(unauthorized('Chưa đăng nhập'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userRepository.findByIdLean(decoded.userId)
    if (!user) return next(unauthorized('Người dùng không tồn tại'))
    if (user.isBanned) return next(forbidden('Tài khoản đã bị khóa bởi admin'))
    req.userId = decoded.userId
    // Always trust the current role in DB (not stale role inside old token payload).
    req.role = user.role
    req.user = user
    next()
  } catch {
    return next(unauthorized('Token không hợp lệ hoặc đã hết hạn'))
  }
}

/**
 * Chỉ cho phép role chỉ định (vd: 'recruiter' hoặc 'student').
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      return next(forbidden('Không có quyền truy cập'))
    }
    next()
  }
}


const requireVerifiedRecruiter = async (req, res, next) => {
  if (req.role !== 'recruiter') {
    return next(forbidden('Chỉ nhà tuyển dụng mới có quyền thực hiện thao tác này'))
  }

  const status = req.user?.verificationStatus || 'none'
  if (status !== 'approved') {
    return next(
      forbidden(`Tài khoản nhà tuyển dụng chưa được duyệt (trạng thái: ${status})`),
    )
  }

  return next()
}

module.exports = { auth, requireRole, requireVerifiedRecruiter }
