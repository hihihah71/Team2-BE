const adminService = require('../services/admin.service')

async function getOverview(req, res) {
  const data = await adminService.getOverview()
  res.json(data)
}

async function listRecruiters(req, res) {
  const users = await adminService.listRecruiters(req.query.status)
  res.json(users)
}

async function listUsers(req, res) {
  const users = await adminService.listUsers(req.query.role)
  res.json(users)
}

async function approveRecruiter(req, res) {
  const user = await adminService.approveRecruiter(req.params.userId)
  res.json(user)
}

async function rejectRecruiter(req, res) {
  const user = await adminService.rejectRecruiter(req.params.userId, req.body?.reason)
  res.json(user)
}

async function listJobs(req, res) {
  const jobs = await adminService.listJobs(req.query.status)
  res.json(jobs)
}

async function getJobDetail(req, res) {
  const job = await adminService.getJobDetail(req.params.jobId)
  res.json(job)
}

async function approveJob(req, res) {
  const job = await adminService.setJobModerationStatus(req.params.jobId, 'approved')
  res.json(job)
}

async function rejectJob(req, res) {
  const job = await adminService.setJobModerationStatus(req.params.jobId, 'rejected')
  res.json(job)
}

async function flagJob(req, res) {
  const job = await adminService.setJobModerationStatus(req.params.jobId, 'flagged')
  res.json(job)
}

async function deleteJob(req, res) {
  const data = await adminService.deleteJob(req.params.jobId)
  res.json(data)
}

async function banJob(req, res) {
  const data = await adminService.banJob(req.params.jobId)
  res.json(data)
}

async function banUser(req, res) {
  const data = await adminService.banUser(req.params.userId, req.userId, req.body?.reason)
  res.json(data)
}

async function unbanUser(req, res) {
  const data = await adminService.unbanUser(req.params.userId)
  res.json(data)
}

async function listReports(req, res) {
  const data = await adminService.listReports(req.query)
  res.json(data)
}

async function resolveReport(req, res) {
  const data = await adminService.resolveReport(req.params.reportId, req.userId)
  res.json(data)
}

module.exports = {
  getOverview,
  listRecruiters,
  listUsers,
  approveRecruiter,
  rejectRecruiter,
  listJobs,
  getJobDetail,
  approveJob,
  rejectJob,
  flagJob,
  banJob,
  deleteJob,
  banUser,
  unbanUser,
  listReports,
  resolveReport,
}
