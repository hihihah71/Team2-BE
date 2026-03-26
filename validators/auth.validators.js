const { ROLES } = require('../constants/domain')

function validateRegister(body) {
  if (!body.fullName || !body.email || !body.password || !body.role) {
    return 'Thiếu dữ liệu bắt buộc'
  }
  if (![ROLES.STUDENT, ROLES.RECRUITER].includes(body.role)) {
    return 'Role không hợp lệ'
  }

  // Regex for standard email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(body.email)) {
    return 'Email không đúng định dạng (vd: name@domain.com)'
  }

  if (body.fullName && (body.fullName.length < 2 || body.fullName.length > 50)) {
    return 'Họ tên phải từ 2 đến 50 ký tự'
  }

  if (String(body.password).length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự'
  }
  return null
}


function validateLogin(body) {
  if (!body.email || !body.password || !body.role) {
    return 'Thiếu email, mật khẩu hoặc loại tài khoản'
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(body.email)) {
    return 'Email không đúng định dạng'
  }
  if (!['student', 'recruiter', 'admin'].includes(String(body.role))) {
    return 'Role không hợp lệ'
  }
  return null
}

module.exports = { validateRegister, validateLogin }
