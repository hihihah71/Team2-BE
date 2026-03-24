const Application = require('../models/Application');
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
  const data = await applicationsService.updateStatus(req.params.id, req.userId, req.body)
  res.json(data)
}

async function rejectMyApplication(req, res) {
  const data = await applicationsService.studentRejectApplication(req.params.id, req.userId)
  res.json(data)
}

async function acceptOffer(req, res) {
  try {
    const app = await applicationsService.acceptOffer(req.params.id, req.userId)
    res.json(app)
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
}

async function refuseOffer(req, res) {
  try {
    const app = await applicationsService.refuseOffer(req.params.id, req.userId)
    res.json(app)
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
}

// ... keep all your other functions (getMyApplications, apply, etc.) ...

// 1. Rewrite this function as an 'async function' to match your style
async function acceptInterview(req, res) {
  try {
    const application = await applicationsService.acceptInterview(req.params.id, req.userId)
    res.json(application)
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message || 'Lỗi máy chủ.' })
  }
}


module.exports = {
  getMyApplications,
  apply,
  getApplicantsByJob,
  getApplicantByJob,
  updateStatus,
  rejectMyApplication,
  acceptOffer,
  refuseOffer,
  acceptInterview, 
}