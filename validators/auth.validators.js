const { ROLES } = require('../constants/domain')

function validateRegister(body) {
  if (!body.fullName || !body.email || !body.password || !body.role) {
    return 'Thiếu dữ liệu bắt buộc'
  }
  if (![ROLES.STUDENT, ROLES.RECRUITER].includes(body.role)) {
    return 'Role không hợp lệ'
  }

  // Regex check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    return 'Email không đúng định dạng'
  }

  if (String(body.password).length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự'
  }
  return null
}


function validateLogin(body) {
  if (!body.email || !body.password) {
    return 'Thiếu email hoặc mật khẩu'
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    return 'Email không đúng định dạng'
  }
  return null
}

module.exports = { validateRegister, validateLogin }
