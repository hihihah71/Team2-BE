const applicationsService = require('../services/applications.service')

async function getMyApplications(req, res) {
  const data = await applicationsService.getStudentApplicationsOverview(req.userId)
  res.json(data)
}

async function apply(req, res) {
  const data = await applicationsService.applyToJob(req.userId, req.body)
  res.status(201).json(data)
}

async function getApplicantsByJob(req, res) {
  const data = await applicationsService.listApplicantsByJob(req.params.jobId, req.userId)
  res.json(data)
}

async function getApplicantByJob(req, res) {
  const data = await applicationsService.getApplicantByJob(
    req.params.jobId,
    req.params.applicantId,
    req.userId,
  )
  res.json(data)
}

async function updateStatus(req, res) {
  const data = await applicationsService.updateStatus(req.params.id, req.userId, req.body.status)
  res.json(data)
}

async function rejectMyApplication(req, res) {
  const data = await applicationsService.studentRejectApplication(req.params.id, req.userId)
  res.json(data)
}

async function accept(req, res) {
  const data = await applicationsService.studentAcceptApplication(req.params.id, req.userId)
  res.json(data)
}

module.exports = {
  getMyApplications,
  apply,
  getApplicantsByJob,
  getApplicantByJob,
  updateStatus,
  rejectMyApplication,
  accept,
}
