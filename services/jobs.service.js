const mongoose = require('mongoose')
const jobRepository = require('../repositories/job.repository')
const applicationRepository = require('../repositories/application.repository')
const savedJobRepository = require('../repositories/savedJob.repository')
const userRepository = require('../repositories/user.repository')
const { JOB_STATUSES } = require('../constants/domain')
const { notFound, forbidden } = require('../utils/httpError')

function normalizeString(value, fallback = '') {
  if (value == null) return fallback
  return String(value).trim()
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item).trim()).filter(Boolean)
}

async function listJobs(query) {
  const parsed = { ...query }
  if (typeof parsed.tags === 'string' && parsed.tags.trim()) {
    parsed.tags = parsed.tags.split(',').map((t) => t.trim()).filter(Boolean)
  } else if (!Array.isArray(parsed.tags)) {
    parsed.tags = []
  }
  const [items, total] = await jobRepository.listPublicJobs({
    ...parsed,
    location: query.location,
    salaryMin: query.salaryMin,
  })
  return { items, total }
}

function listMyJobs(recruiterId) {
  return jobRepository.listRecruiterJobs(recruiterId)
}

async function getJobDetail(jobId) {
  const job = await jobRepository.findByIdLean(jobId)
  if (!job) {
    throw notFound('Không tìm thấy tin tuyển dụng')
  }
  return job
}

async function createJob(recruiterId, payload) {
  const recruiter = await userRepository.findByIdLean(recruiterId)
  if (!recruiter || recruiter.role !== 'recruiter') {
    throw forbidden('Bạn không có quyền đăng bài tuyển dụng')
  }
  if (recruiter.verificationStatus !== 'approved') {
    throw forbidden('Tài khoản recruiter chưa được admin duyệt')
  }

  return jobRepository.create({
    recruiterId,
    title: normalizeString(payload.title),
    company: normalizeString(payload.company),
    location: normalizeString(payload.location),
    phone: normalizeString(payload.phone),
    imageUrl: normalizeString(payload.imageUrl),
    description: normalizeString(payload.description),
    requirements: normalizeString(payload.requirements),
    jobType: normalizeString(payload.jobType),
    experienceLevel: normalizeString(payload.experienceLevel),
    currency: normalizeString(payload.currency, 'VND') || 'VND',
    skills: normalizeStringArray(payload.skills),
    experienceYears: payload.experienceYears ?? null,
    salaryMin: payload.salaryMin ?? null,
    salaryMax: payload.salaryMax ?? null,
    deadline: payload.deadline ? new Date(payload.deadline) : null,
    status: payload.status || JOB_STATUSES.OPEN,
    tags: normalizeStringArray(payload.tags),
  })
}

async function updateJob(jobId, recruiterId, payload) {
  const job = await jobRepository.findOwnedByRecruiter(jobId, recruiterId)
  if (!job) {
    throw notFound('Không tìm thấy tin hoặc không có quyền sửa')
  }

  const allowed = [
    'title',
    'company',
    'location',
    'phone',
    'imageUrl',
    'description',
    'requirements',
    'jobType',
    'experienceLevel',
    'currency',
    'skills',
    'experienceYears',
    'salaryMin',
    'salaryMax',
    'deadline',
    'status',
    'tags',
  ]

  allowed.forEach((key) => {
    if (payload[key] !== undefined) {
      if (key === 'deadline') job[key] = payload[key] ? new Date(payload[key]) : null
      else if (key === 'skills' || key === 'tags') job[key] = normalizeStringArray(payload[key])
      else if (
        key === 'title' ||
        key === 'company' ||
        key === 'location' ||
        key === 'phone' ||
        key === 'imageUrl' ||
        key === 'description' ||
        key === 'requirements' ||
        key === 'jobType' ||
        key === 'experienceLevel' ||
        key === 'currency'
      ) {
        job[key] = normalizeString(payload[key])
      }
      else job[key] = payload[key]
    }
  })

  await job.save()
  return job
}

async function deleteJob(jobId, recruiterId) {
  const deleted = await jobRepository.findOneAndDeleteOwned(jobId, recruiterId)
  if (!deleted) {
    throw notFound('Không tìm thấy tin hoặc không có quyền xóa')
  }
  return { message: 'Đã xóa tin' }
}

async function getJobStats(jobId, recruiterId) {
  const job = await jobRepository.findOwnedByRecruiter(jobId, recruiterId)
  if (!job) {
    throw notFound('Không tìm thấy tin hoặc không có quyền')
  }

  const grouped = await applicationRepository.aggregateStatusByJob(
    new mongoose.Types.ObjectId(job._id),
  )

  const byStatus = {}
  let total = 0
  grouped.forEach((item) => {
    byStatus[item._id] = item.count
    total += item.count
  })
  return { total, byStatus, detailViewCount: job.detailViewCount || 0 }
}

async function trackJobDetailView(jobId) {
  const updated = await jobRepository.incrementDetailViewCount(jobId)
  if (!updated) {
    throw notFound('Không tìm thấy tin tuyển dụng')
  }
  return { detailViewCount: updated.detailViewCount || 0 }
}

async function saveJob(jobId, userId) {
  const job = await jobRepository.findByIdLean(jobId)
  if (!job) throw notFound('Không tìm thấy tin')
  await savedJobRepository.upsert(userId, job._id)
  return { message: 'Đã lưu tin' }
}

async function unsaveJob(jobId, userId) {
  await savedJobRepository.remove(userId, jobId)
  return { message: 'Đã bỏ lưu tin' }
}

async function deleteMultipleJobs(jobIds, recruiterId) {
  return await jobRepository.deleteMany({
    _id: { $in: jobIds },
    recruiterId: recruiterId
  });
}

module.exports = {
  listJobs,
  listMyJobs,
  getJobDetail,
  createJob,
  updateJob,
  deleteJob,
  getJobStats,
  trackJobDetailView,
  saveJob,
  unsaveJob,
  deleteMultipleJobs
}