const Job = require('../models/Job')
const { JOB_STATUSES } = require('../constants/domain')

function listPublicJobs({ page, limit, search, status, tags }) {
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * limitNum
  const filter = { status: status || JOB_STATUSES.OPEN }

  if (search && String(search).trim()) {
    const escapedSearch = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.$or = [
      { title: new RegExp(escapedSearch, 'i') },
      { company: new RegExp(escapedSearch, 'i') },
      { description: new RegExp(escapedSearch, 'i') },
    ]
  }

  if (tags && tags.length > 0) {
    filter.tags = { $all: tags }
  }

  return Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Job.countDocuments(filter),
  ])
}

function listRecruiterJobs(recruiterId) {
  return Job.find({ recruiterId }).sort({ createdAt: -1 }).lean()
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
  findOneAndDeleteOwned,
  deleteMany,
}
