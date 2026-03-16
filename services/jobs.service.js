const mongoose = require('mongoose')
const jobRepository = require('../repositories/job.repository')
const applicationRepository = require('../repositories/application.repository')
const savedJobRepository = require('../repositories/savedJob.repository')
const { JOB_STATUSES } = require('../constants/domain')
const { notFound } = require('../utils/httpError')

async function listJobs(query) {
  const parsed = { ...query }
  if (typeof parsed.tags === 'string' && parsed.tags.trim()) {
    parsed.tags = parsed.tags.split(',').map((t) => t.trim()).filter(Boolean)
  } else if (!Array.isArray(parsed.tags)) {
    parsed.tags = []
  }
  const [items, total] = await jobRepository.listPublicJobs(parsed)
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
  return jobRepository.create({
    recruiterId,
    title: payload.title,
    company: payload.company,
    location: payload.location || '',
    description: payload.description || '',
    requirements: payload.requirements || '',
    experienceYears: payload.experienceYears ?? null,
    salaryMin: payload.salaryMin ?? null,
    salaryMax: payload.salaryMax ?? null,
    deadline: payload.deadline ? new Date(payload.deadline) : null,
    status: payload.status || JOB_STATUSES.OPEN,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
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
    'description',
    'requirements',
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
}
