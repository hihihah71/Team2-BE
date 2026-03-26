const Job = require('../models/Job')
const { JOB_STATUSES, JOB_MODERATION_STATUSES } = require('../constants/domain')

async function listPublicJobs({ page, limit, search, status, tags, location, salaryMin }) {
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12))
  const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * limitNum
  const filter = { status: status || JOB_STATUSES.OPEN }
  filter.moderationStatus = { $ne: JOB_MODERATION_STATUSES.REJECTED }

  const escapeRegex = (str) => String(str).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  if (search && String(search).trim()) {
    const escapedSearch = escapeRegex(search)
    filter.$or = [
      { title: new RegExp(escapedSearch, 'i') },
      { company: new RegExp(escapedSearch, 'i') },
      { description: new RegExp(escapedSearch, 'i') },
    ]
  }

  if (location && String(location).trim()) {
    filter.location = new RegExp(escapeRegex(location), 'i')
  }

  if (salaryMin != null) {
    const sMin = parseInt(salaryMin, 10)
    if (!isNaN(sMin)) {
      filter.salaryMin = { $gte: sMin }
    }
  }

  if (tags && tags.length > 0) {
    filter.tags = { $all: tags }
  }

  const [items, total] = await Promise.all([
    Job.find(filter)
      .populate('recruiterId', 'isVerifiedRecruiter')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Job.countDocuments(filter),
  ])

  const mapped = items.map(job => ({
    ...job,
    isVerifiedRecruiter: job.recruiterId?.isVerifiedRecruiter || false,
    recruiterId: job.recruiterId?._id || job.recruiterId // Keep ID if populated, or fallback
  }))

  return [mapped, total]
}

async function listRecruiterJobs(recruiterId) {
  const jobs = await Job.find({ recruiterId }).sort({ createdAt: -1 }).lean()
  return jobs.map(j => ({ ...j, isVerifiedRecruiter: true })) // Recruiter's own jobs are "verified" to them or we can just omit
}

function findByIdLean(id) {
  return Job.findById(id).lean()
}

function findOwnedByRecruiter(id, recruiterId) {
  return Job.findOne({ _id: id, recruiterId })
}

function incrementDetailViewCount(id) {
  return Job.findByIdAndUpdate(
    id,
    { $inc: { detailViewCount: 1 } },
    { new: true, projection: { _id: 1, detailViewCount: 1 } },
  ).lean()
}

function create(payload) {
  return Job.create(payload)
}

function updateById(id, update) {
  return Job.findByIdAndUpdate(id, update, { new: true })
}

function findOneAndDeleteOwned(id, recruiterId) {
  return Job.findOneAndDelete({ _id: id, recruiterId })
}

function deleteMany(filter) {
  return Job.deleteMany(filter)
}

module.exports = {
  listPublicJobs,
  listRecruiterJobs,
  findByIdLean,
  findOwnedByRecruiter,
  incrementDetailViewCount,
  create,
  updateById,
  findOneAndDeleteOwned,
  deleteMany,
}
