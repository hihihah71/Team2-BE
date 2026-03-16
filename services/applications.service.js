const jobRepository = require('../repositories/job.repository')
const applicationRepository = require('../repositories/application.repository')
const savedJobRepository = require('../repositories/savedJob.repository')
const cvRepository = require('../repositories/cv.repository')
const profileRepository = require('../repositories/profile.repository')
const userRepository = require('../repositories/user.repository')
const notificationsService = require('./notifications.service')
const { APPLICATION_STATUS_FLOW } = require('../constants/domain')
const { badRequest, notFound } = require('../utils/httpError')

async function getStudentApplicationsOverview(userId) {
  const [applications, savedIds] = await Promise.all([
    applicationRepository.listByApplicantId(userId),
    savedJobRepository.findSavedJobIdsByUser(userId),
  ])

  const savedJobs = savedIds.length
    ? await Promise.all(savedIds.map((id) => jobRepository.findByIdLean(id)))
    : []

  return {
    applications,
    savedJobs: savedJobs.filter(Boolean),
  }
}

async function applyToJob(userId, payload) {
  const job = await jobRepository.findByIdLean(payload.jobId)
  if (!job) throw notFound('Không tìm thấy tin tuyển dụng')

  if (job.status !== 'open') {
    throw badRequest('Tin tuyển dụng không còn mở để ứng tuyển')
  }
  if (job.deadline && new Date(job.deadline).getTime() < Date.now()) {
    throw badRequest('Tin tuyển dụng đã hết hạn nhận hồ sơ')
  }

  const existing = await applicationRepository.findByJobAndApplicant(payload.jobId, userId)
  const cvSource = payload.cvSource || (payload.cvId ? 'uploaded_cv' : 'profile_default')
  let cvId = null
  let profileCvSnapshot = null

  if (cvSource === 'uploaded_cv') {
    if (!payload.cvId) {
      throw badRequest('Vui lòng chọn CV PDF đã upload')
    }
    const ownedCv = await cvRepository.findOwnedCv(payload.cvId, userId)
    if (!ownedCv) {
      throw badRequest('CV không tồn tại hoặc không thuộc tài khoản của bạn')
    }
    cvId = ownedCv._id
  } else if (cvSource === 'profile_default') {
    const profile = await profileRepository.findByUserIdLean(userId)
    if (!profile) {
      throw badRequest('Bạn chưa có profile để tạo CV mặc định')
    }
    const personalInfo = profile.personalInfo || {}
    profileCvSnapshot = {
      fullName: personalInfo.fullName || '',
      email: personalInfo.email || '',
      phone: personalInfo.phone || '',
      address: personalInfo.address || '',
      summary: personalInfo.summary || '',
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      educations: Array.isArray(profile.educations) ? profile.educations : [],
      experiences: Array.isArray(profile.experiences) ? profile.experiences : [],
      projects: Array.isArray(profile.projects) ? profile.projects : [],
    }
  } else {
    throw badRequest('Nguồn CV không hợp lệ')
  }

  let app
  let isReapply = false

  if (existing) {
    if (existing.status !== 'rejected') {
      throw badRequest('Bạn đã ứng tuyển tin này rồi')
    }
    isReapply = true
    existing.cvId = cvId
    existing.cvSource = cvSource
    existing.profileCvSnapshot = profileCvSnapshot
    existing.coverLetter = payload.coverLetter || ''
    existing.status = 'pending'
    existing.rejectedBy = null
    existing.statusHistory = Array.isArray(existing.statusHistory) ? existing.statusHistory : []
    existing.statusHistory.push({ status: 'pending', updatedAt: new Date() })
    await existing.save()
    app = existing
  } else {
    app = await applicationRepository.create({
      jobId: payload.jobId,
      applicantId: userId,
      cvId,
      cvSource,
      profileCvSnapshot,
      coverLetter: payload.coverLetter || '',
      statusHistory: [{ status: 'pending', updatedAt: new Date() }],
    })
  }

  const [applicantUser, applicantProfile] = await Promise.all([
    userRepository.findByIdLean(userId),
    profileRepository.findByUserIdLean(userId),
  ])
  const applicantName =
    applicantProfile?.personalInfo?.fullName ||
    applicantUser?.fullName ||
    applicantUser?.email ||
    'Một ứng viên'

  await notificationsService.createNotification({
    userId: job.recruiterId,
    type: 'new_application',
    title: isReapply ? 'Ứng viên nộp lại hồ sơ' : 'Có ứng viên mới ứng tuyển',
    message: isReapply
      ? `${applicantName} đã nộp lại hồ sơ vào bài đăng "${job.title}".`
      : `${applicantName} vừa ứng tuyển vào bài đăng "${job.title}".`,
    entityType: 'job',
    entityId: job._id,
  })

  return applicationRepository.findByIdWithRelations(app._id)
}

async function listApplicantsByJob(jobId, recruiterId) {
  const job = await jobRepository.findOwnedByRecruiter(jobId, recruiterId)
  if (!job) throw notFound('Không tìm thấy tin hoặc không có quyền')
  return applicationRepository.listByJobId(job._id)
}

async function getApplicantByJob(jobId, applicantId, recruiterId) {
  const job = await jobRepository.findOwnedByRecruiter(jobId, recruiterId)
  if (!job) throw notFound('Không tìm thấy tin hoặc không có quyền')
  const app = await applicationRepository.findOneByJobAndApplicantWithRelations(jobId, applicantId)
  if (!app) throw notFound('Không tìm thấy đơn ứng tuyển')
  return app
}

async function updateStatus(applicationId, recruiterId, status) {
  const app = await applicationRepository.findByIdWithJob(applicationId)
  if (!app || String(app.jobId.recruiterId) !== String(recruiterId)) {
    throw notFound('Không tìm thấy đơn hoặc không có quyền')
  }

  const allowedTransitions = APPLICATION_STATUS_FLOW[app.status] || []
  if (app.status !== status && !allowedTransitions.includes(status)) {
    throw badRequest('Chuyển trạng thái không hợp lệ')
  }

  app.status = status
  app.rejectedBy = status === 'rejected' ? 'recruiter' : null
  app.statusHistory = Array.isArray(app.statusHistory) ? app.statusHistory : []
  app.statusHistory.push({ status, updatedAt: new Date() })
  await app.save()

  await notificationsService.createNotification({
    userId: app.applicantId,
    type: 'application_update',
    title: 'Cập nhật trạng thái ứng tuyển',
    message: `Đơn ứng tuyển cho bài "${app.jobId.title || 'Không rõ tiêu đề'}" đã được cập nhật sang trạng thái "${status}".`,
    entityType: 'job',
    entityId: app.jobId._id,
  })

  return applicationRepository.findByIdWithRelations(app._id)
}

async function studentRejectApplication(applicationId, studentId) {
  const app = await applicationRepository.findByIdAndApplicant(applicationId, studentId)
  if (!app) {
    throw notFound('Không tìm thấy đơn hoặc không có quyền')
  }
  if (app.status === 'rejected') {
    throw badRequest('Đơn đã ở trạng thái từ chối')
  }

  app.status = 'rejected'
  app.rejectedBy = 'student'
  app.statusHistory = Array.isArray(app.statusHistory) ? app.statusHistory : []
  app.statusHistory.push({ status: 'rejected', updatedAt: new Date() })
  await app.save()

  const [studentUser, studentProfile] = await Promise.all([
    userRepository.findByIdLean(studentId),
    profileRepository.findByUserIdLean(studentId),
  ])
  const studentName =
    studentProfile?.personalInfo?.fullName ||
    studentUser?.fullName ||
    studentUser?.email ||
    'Một ứng viên'

  await notificationsService.createNotification({
    userId: app.jobId.recruiterId,
    type: 'application_rejected_by_student',
    title: 'Ứng viên từ chối công việc',
    message: `${studentName} đã từ chối tiếp tục ứng tuyển bài "${app.jobId.title || 'Không rõ tiêu đề'}".`,
    entityType: 'job',
    entityId: app.jobId._id,
  })

  return applicationRepository.findByIdWithRelations(app._id)
}

module.exports = {
  getStudentApplicationsOverview,
  applyToJob,
  listApplicantsByJob,
  getApplicantByJob,
  updateStatus,
  studentRejectApplication,
}
