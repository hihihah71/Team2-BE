const reportRepository = require('../repositories/report.repository')
const jobRepository = require('../repositories/job.repository')
const userRepository = require('../repositories/user.repository')
const { badRequest, notFound } = require('../utils/httpError')
const { REPORT_STATUSES, JOB_MODERATION_STATUSES } = require('../constants/domain')

const AUTO_FLAG_REPORT_THRESHOLD = Number(process.env.AUTO_FLAG_REPORT_THRESHOLD || 3)

async function createReport(reporterId, payload) {
  const targetType = payload?.targetType
  const targetId = payload?.targetId
  const reason = String(payload?.reason || '').trim()

  if (!targetType || !['job', 'recruiter'].includes(targetType)) {
    throw badRequest('Loại báo cáo không hợp lệ')
  }
  if (!targetId) throw badRequest('Thiếu đối tượng báo cáo')
  if (!reason || reason.length < 5) throw badRequest('Lý do báo cáo phải có ít nhất 5 ký tự')

  const existing = await reportRepository.findByReporterAndTarget(reporterId, targetType, targetId)
  if (existing) throw badRequest('Bạn đã báo cáo nội dung này rồi')

  if (targetType === 'job') {
    const job = await jobRepository.findByIdLean(targetId)
    if (!job) throw notFound('Không tìm thấy tin tuyển dụng')
  } else {
    const recruiter = await userRepository.findByIdLean(targetId)
    if (!recruiter || recruiter.role !== 'recruiter') throw notFound('Không tìm thấy nhà tuyển dụng')
  }

  const report = await reportRepository.create({
    reporterId,
    targetType,
    targetId,
    reason,
    status: REPORT_STATUSES.PENDING,
  })

  if (targetType === 'job') {
    const reportCount = await reportRepository.countByTarget('job', targetId, REPORT_STATUSES.PENDING)
    await jobRepository.updateById(targetId, {
      reportCount,
      ...(reportCount >= AUTO_FLAG_REPORT_THRESHOLD
        ? { moderationStatus: JOB_MODERATION_STATUSES.FLAGGED }
        : {}),
    })
  }

  return report
}

module.exports = { createReport }
