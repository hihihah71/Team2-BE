const Application = require('../models/Application')

function listByApplicantId(applicantId) {
  return Application.find({ applicantId })
    .populate('jobId', 'title company location status')
    .sort({ createdAt: -1 })
    .lean()
}

function findByJobAndApplicant(jobId, applicantId) {
  return Application.findOne({ jobId, applicantId })
}

function findByIdAndApplicant(id, applicantId) {
  return Application.findOne({ _id: id, applicantId }).populate('jobId', 'recruiterId title company')
}

function create(payload) {
  return Application.create(payload)
}

function findByIdWithJob(id) {
  return Application.findById(id).populate('jobId', 'recruiterId title company')
}

function findByIdWithRelations(id) {
  return Application.findById(id)
    .populate('applicantId', 'fullName email')
    .populate('cvId', 'name fileUrl fileMimeType fileSize')
    .lean()
}

function listByJobId(jobId) {
  return Application.find({ jobId })
    .populate('applicantId', 'fullName email')
    .populate('cvId', 'name fileUrl')
    .sort({ createdAt: -1 })
    .lean()
}

function findOneByJobAndApplicantWithRelations(jobId, applicantId) {
  return Application.findOne({ jobId, applicantId })
    .populate('applicantId', 'fullName email')
    .populate('cvId', 'name fileUrl fileMimeType fileSize')
    .lean()
}

function aggregateStatusByJob(jobId) {
  return Application.aggregate([
    { $match: { jobId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])
}

function listByJobIds(jobIds) {
  return Application.find({ jobId: { $in: jobIds } }, { createdAt: 1, status: 1, jobId: 1 }).lean()
}

function findOneByCvId(cvId) {
  return Application.findOne({ cvId }).populate('jobId', 'recruiterId')
}

module.exports = {
  listByApplicantId,
  findByJobAndApplicant,
  findByIdAndApplicant,
  create,
  findByIdWithJob,
  findByIdWithRelations,
  listByJobId,
  findOneByJobAndApplicantWithRelations,
  aggregateStatusByJob,
  listByJobIds,
  findOneByCvId,
}
