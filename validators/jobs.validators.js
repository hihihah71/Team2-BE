const { JOB_STATUSES } = require('../constants/domain')

function validateCreateJob(body) {
  if (!body.title || body.title.trim().length < 5) return 'Tiêu đề công việc phải có ít nhất 5 ký tự'
  if (!body.company || body.company.trim().length < 2) return 'Tên công ty phải có ít nhất 2 ký tự'
  
  if (body.salaryMin != null && body.salaryMax != null) {
    if (Number(body.salaryMin) > Number(body.salaryMax)) {
      return 'Lương tối thiểu không được lớn hơn lương tối đa'
    }
  }

  if (body.phone && !/^[0-9+ ]{10,15}$/.test(body.phone)) {
    return 'Số điện thoại không hợp lệ (10-15 chữ số)'
  }

  return null
}

function validateUpdateJob(body) {
  if (body.status && !Object.values(JOB_STATUSES).includes(body.status)) {
    return 'Trạng thái job không hợp lệ'
  }
  if (body.salaryMin != null && body.salaryMax != null) {
    if (Number(body.salaryMin) > Number(body.salaryMax)) {
      return 'Lương tối thiểu không được lớn hơn lương tối đa'
    }
  }
  if (body.phone && !/^[0-9+ ]{10,15}$/.test(body.phone)) {
    return 'Số điện thoại không hợp lệ'
  }
  return null
}

module.exports = { validateCreateJob, validateUpdateJob }
