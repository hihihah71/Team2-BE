const reportService = require('../services/report.service')

async function createReport(req, res) {
  const data = await reportService.createReport(req.userId, req.body || {})
  res.status(201).json(data)
}

module.exports = { createReport }
