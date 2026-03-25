function validateSaveProfile(body) {
  if (!body.personalInfo) {
    return 'Thiếu thông tin cá nhân'
  }

  const { phone, email, fullName } = body.personalInfo

  // Validate Full Name (if provided)
  if (fullName != null && fullName.trim() === '') {
    return 'Họ tên không được để trống'
  }

  // Validate Email (if provided)
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Email không đúng định dạng'
    }
  }

  // Validate Phone (if provided)
  if (phone) {
    // VN Phone Regex: 10 digits starting with 0, or 84 prefix
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
    if (!phoneRegex.test(phone)) {
      return 'Số điện thoại không hợp lệ (vui lòng nhập 10 chữ số bắt đầu bằng 0...)'
    }
  }

  // Validate basic lists (ensure they are arrays if provided)
  if (body.skills && !Array.isArray(body.skills)) {
    return 'Dữ liệu kỹ năng không hợp lệ'
  }
  if (body.experiences && !Array.isArray(body.experiences)) {
    return 'Dữ liệu kinh nghiệm không hợp lệ'
  }

  return null
}

module.exports = { validateSaveProfile }
