const User = require('../models/User')
const Job = require('../models/Job')
const Report = require('../models/Report')
const notificationsService = require('./notifications.service')
const { notFound, badRequest } = require('../utils/httpError')
const { JOB_MODERATION_STATUSES } = require('../constants/domain')

async function getOverview() {
  const [totalUsers, totalRecruiters, totalJobs, totalReports, flaggedJobs] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: 'recruiter' }),
    Job.countDocuments({}),
    Report.countDocuments({}),
    Job.countDocuments({ moderationStatus: JOB_MODERATION_STATUSES.FLAGGED }),
  ])

  return { totalUsers, totalRecruiters, totalJobs, totalReports, flaggedJobs }
}

function listRecruiters(status = 'pending') {
  const filter = { role: 'recruiter' }
  if (status === 'approved') filter.verificationStatus = 'approved'
  if (status === 'pending') filter.verificationStatus = { $in: ['none', 'pending', 'rejected'] }
  return User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).lean()
}

function listUsers(role) {
  const filter = {}
  if (role && ['student', 'recruiter', 'admin'].includes(role)) filter.role = role
  return User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).lean()
}

async function approveRecruiter(userId) {
  const user = await User.findOneAndUpdate(
    { _id: userId, role: 'recruiter' },
    { verificationStatus: 'approved', isVerified: true, verificationRejectReason: '' },
    { new: true },
  )
    .select('-passwordHash')
    .lean()
  if (!user) throw notFound('Không tìm thấy recruiter')
  return user
}

async function rejectRecruiter(userId, reason = '') {
  const user = await User.findOneAndUpdate(
    { _id: userId, role: 'recruiter' },
    { verificationStatus: 'rejected', isVerified: false, verificationRejectReason: String(reason || '').trim() },
    { new: true },
  )
    .select('-passwordHash')
    .lean()
  if (!user) throw notFound('Không tìm thấy recruiter')
  return user
}

function listJobs(status) {
  const filter = {}
  if (status && Object.values(JOB_MODERATION_STATUSES).includes(status)) {
    filter.moderationStatus = status
  }
  return Job.find(filter).sort({ createdAt: -1 }).lean()
}

async function getJobDetail(jobId) {
  const job = await Job.findById(jobId).lean()
  if (!job) throw notFound('Không tìm thấy bài đăng')
  return job
}

async function setJobModerationStatus(jobId, moderationStatus) {
  if (!Object.values(JOB_MODERATION_STATUSES).includes(moderationStatus)) {
    throw badRequest('Trạng thái moderation không hợp lệ')
  }
  const job = await Job.findByIdAndUpdate(jobId, { moderationStatus }, { new: true }).lean()
  if (!job) throw notFound('Không tìm thấy job')
  return job
}

async function deleteJob(jobId) {
  const deleted = await Job.findByIdAndDelete(jobId).lean()
  if (!deleted) throw notFound('Không tìm thấy job')
  return { message: 'Đã xóa job' }
}

async function banJob(jobId) {
  const oldJob = await Job.findById(jobId).lean()
  if (!oldJob) throw notFound('Không tìm thấy job')

  const job = await Job.findByIdAndUpdate(
    jobId,
    { moderationStatus: JOB_MODERATION_STATUSES.REJECTED, status: 'closed' },
    { new: true },
  ).lean()

  if (oldJob.moderationStatus !== JOB_MODERATION_STATUSES.REJECTED) {
    await notificationsService.createNotification({
      userId: oldJob.recruiterId,
      type: 'job_banned',
      title: 'Bài đăng đã bị admin ban',
      message: `Bài đăng "${oldJob.title || 'Không rõ tiêu đề'}" đã bị admin ban. Vui lòng mở chi tiết bài để xem trạng thái.`,
      entityType: 'job',
      entityId: oldJob._id,
    })
  }

  return job
}

async function banUser(userId, adminId, reason = '') {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isBanned: true,
      bannedReason: String(reason || '').trim(),
      bannedAt: new Date(),
      bannedBy: adminId,
    },
    { new: true },
  )
    .select('-passwordHash')
    .lean()
  if (!user) throw notFound('Không tìm thấy user')
  return user
}

async function unbanUser(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { isBanned: false, bannedReason: '', bannedAt: null, bannedBy: null },
    { new: true },
  )
    .select('-passwordHash')
    .lean()
  if (!user) throw notFound('Không tìm thấy user')
  return user
}

async function listReports(query) {
  const filter = {}
  if (query.status) filter.status = query.status
  if (query.targetType) filter.targetType = query.targetType
  return Report.find(filter).sort({ createdAt: -1 }).lean()
}

async function resolveReport(reportId, adminId) {
  const report = await Report.findByIdAndUpdate(
    reportId,
    { status: 'resolved', resolvedAt: new Date(), resolvedBy: adminId },
    { new: true },
  ).lean()
  if (!report) throw notFound('Không tìm thấy report')
  return report
}

module.exports = {
  getOverview,
  listRecruiters,
  listUsers,
  approveRecruiter,
  rejectRecruiter,
  listJobs,
  getJobDetail,
  setJobModerationStatus,
  banJob,
  deleteJob,
  banUser,
  unbanUser,
  listReports,
  resolveReport,
}
