function validateCreateCv(body) {
  if (!body.name) {
    return 'Thiếu tên CV'
  }
  if (body.fileDataBase64 && typeof body.fileDataBase64 !== 'string') {
    return 'Dữ liệu file không hợp lệ'
  }
  if (body.fileDataBase64 && body.fileDataBase64.length > 12 * 1024 * 1024) {
    return 'File quá lớn'
  }
  return null
}

module.exports = { validateCreateCv }
