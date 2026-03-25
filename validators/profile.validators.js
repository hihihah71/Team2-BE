function validateSaveProfile(body) {
  if (!body.personalInfo) {
    return 'Thiếu thông tin cá nhân'
  }

  const { phone, email, fullName, role, summary, address, avatarUrl, coverUrl } = body.personalInfo

  // Validate image sizes (base64) - ~2MB limit (approx 2.7M chars)
  if (avatarUrl && avatarUrl.length > 3000000) return 'Dung lượng ảnh đại diện quá lớn (tối đa 2MB)'
  if (coverUrl && coverUrl.length > 3000000) return 'Dung lượng ảnh bìa quá lớn (tối đa 2MB)'

  // Validate Full Name
  if (fullName != null) {
    if (fullName.trim() === '') return 'Họ tên không được để trống'
    if (fullName.length > 50) return 'Họ tên không được quá 50 ký tự'
  }

  // Validate Role
  if (role && role.length > 100) return 'Vị trí/Chuyên môn không được quá 100 ký tự'

  // Validate Summary
  if (summary && summary.length > 2000) return 'Giới thiệu bản thân không được quá 2000 ký tự'

  // Validate Address
  if (address && address.length > 200) return 'Địa chỉ không được quá 200 ký tự'

  // Validate Email
  if (email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) return 'Email không đúng định dạng'
    if (email.length > 100) return 'Email không được quá 100 ký tự'
  }

  // Validate Phone
  if (phone) {
    const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/
    if (!phoneRegex.test(phone)) return 'Số điện thoại không đúng định dạng (10 số, bắt đầu bằng 0 hoặc 84)'
    if (phone.length > 15) return 'Số điện thoại không được quá 15 ký tự'
  }

  // Validate basic lists
  if (body.skills && (!Array.isArray(body.skills) || body.skills.length > 50)) {
    return 'Dữ liệu kỹ năng không hợp lệ hoặc quá nhiều (tối đa 50)'
  }
  if (body.experiences && !Array.isArray(body.experiences)) return 'Dữ liệu kinh nghiệm không hợp lệ'
  if (body.educations && !Array.isArray(body.educations)) return 'Dữ liệu học vấn không hợp lệ'

  return null
}

module.exports = { validateSaveProfile }
