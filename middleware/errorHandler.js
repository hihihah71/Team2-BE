const { HttpError } = require('../utils/httpError')

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  if (error.name === 'CastError') {
    return res.status(404).json({
      message: 'Không tìm thấy dữ liệu',
      requestId: req.requestId,
    })
  }

  if (error.code === 11000) {
    return res.status(400).json({
      message: 'Dữ liệu đã tồn tại',
      requestId: req.requestId,
    })
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'File upload quá lớn. Vui lòng chọn file nhỏ hơn 5MB.',
      code: 'PAYLOAD_TOO_LARGE',
      requestId: req.requestId,
    })
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      requestId: req.requestId,
    })
  }

  console.error(error)
  return res.status(500).json({
    message: 'Lỗi server',
    requestId: req.requestId,
  })
}

module.exports = { errorHandler }
