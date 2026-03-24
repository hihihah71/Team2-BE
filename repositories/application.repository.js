const Application = require('../models/Application')

async function listByApplicantId(applicantId) {
  return Application.find({ applicantId })
    .populate('jobId') 
    .sort({ createdAt: -1 })
    .lean();
}

function findByJobAndApplicant(jobId, applicantId) {
  return Application.findOne({ jobId, applicantId })
}

async function findByIdAndApplicant(id, applicantId) {
  return Application.findOne({ _id: id, applicantId })
    .populate('jobId'); 
}

function create(payload) {
  return Application.create(payload)
}

async function findByIdWithJob(id) {
  return Application.findById(id)
    .populate({
      path: 'jobId',
      select: 'recruiterId title company',
    })
    ; 
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

async function acceptOffer(applicationId, userId) {
  const app = await Application.findOne({ _id: applicationId, applicantId: userId })

  if (!app) throw new Error('Application not found')

  if (app.status !== 'offered') {
    throw new Error('Only offered applications can be accepted')
  }

  app.status = 'accepted'
  app.statusHistory.push({ status: 'accepted' })

  await app.save()
  return app
}

async function refuseOffer(applicationId, userId) {
  const app = await Application.findOne({ _id: applicationId, applicantId: userId })

  if (!app) throw new Error('Application not found')

  if (app.status !== 'offered') {
    throw new Error('Only offered applications can be refused')
  }

  app.status = 'refused'
  app.rejectedBy = 'student'
  app.statusHistory.push({ status: 'refused' })

  await app.save()
  return app
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
  acceptOffer,
  refuseOffer,
}
