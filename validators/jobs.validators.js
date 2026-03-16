const { JOB_STATUSES } = require('../constants/domain')

function validateCreateJob(body) {
  if (!body.title || !body.company) {
    return 'Thiếu tiêu đề hoặc tên công ty'
  }
  return null
}

function validateUpdateJob(body) {
  if (body.status && !Object.values(JOB_STATUSES).includes(body.status)) {
    return 'Trạng thái job không hợp lệ'
  }
  return null
}

module.exports = { validateCreateJob, validateUpdateJob }
