const dashboardService = require('../services/dashboard.service')

async function getStudentDashboard(req, res) {
  const data = await dashboardService.getStudentDashboard(req.userId)
  res.json(data)
}

async function getRecruiterDashboard(req, res) {
  const data = await dashboardService.getRecruiterDashboard(req.userId)
  res.json(data)
}

module.exports = { getStudentDashboard, getRecruiterDashboard }
