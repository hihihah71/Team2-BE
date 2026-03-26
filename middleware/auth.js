const jwt = require('jsonwebtoken')
const { unauthorized, forbidden } = require('../utils/httpError')

/**
 * Xác thực JWT, gắn req.user (id, role). Dùng cho route cần đăng nhập.
 */
function auth(req, res, next) {
  const authHeader = req.headers.authorization
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const tokenFromQuery = typeof req.query.token === 'string' ? req.query.token : null
  const token = tokenFromHeader || tokenFromQuery

  if (!token) {
    return next(unauthorized('Chưa đăng nhập'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    req.role = decoded.role
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
  if (req.userRole !== 'recruiter') {
    return res.status(403).json({ message: "Only recruiters can perform this action." });
  }

  if (!req.isVerifiedRecruiter) {
    return res.status(403).json({ 
      message: "Access Denied. Your recruiter account is pending admin approval.",
      step: req.verificationStep 
    });
  }
  
  next();
};

module.exports = { auth, requireRole, requireVerifiedRecruiter }
