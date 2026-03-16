const { APPLICATION_STATUSES } = require('../constants/domain')

function validateApply(body) {
  if (!body.jobId) {
    return 'Thiếu jobId'
  }
  if (body.cvSource && !['uploaded_cv', 'profile_default'].includes(body.cvSource)) {
    return 'Nguồn CV không hợp lệ'
  }
  if (body.cvSource === 'uploaded_cv' && !body.cvId) {
    return 'Vui lòng chọn CV PDF đã upload'
  }
  return null
}

function validateStatusUpdate(body) {
  if (!body.status) {
    return 'Thiếu trạng thái'
  }
  if (!Object.values(APPLICATION_STATUSES).includes(body.status)) {
    return 'Trạng thái không hợp lệ'
  }
  return null
}

module.exports = { validateApply, validateStatusUpdate }
