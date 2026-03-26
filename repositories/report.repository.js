const Report = require('../models/Report')

function create(payload) {
  return Report.create(payload)
}

function findByReporterAndTarget(reporterId, targetType, targetId) {
  return Report.findOne({ reporterId, targetType, targetId })
}

function countByTarget(targetType, targetId, status) {
  return Report.countDocuments({ targetType, targetId, ...(status ? { status } : {}) })
}

function listReports({ status, targetType, page, limit }) {
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
  const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * limitNum
  const filter = {}
  if (status) filter.status = status
  if (targetType) filter.targetType = targetType

  return Promise.all([
    Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Report.countDocuments(filter),
  ])
}

function resolve(reportId, adminId) {
  return Report.findByIdAndUpdate(
    reportId,
    { status: 'resolved', resolvedAt: new Date(), resolvedBy: adminId },
    { new: true },
  ).lean()
}

function countAll() {
  return Report.countDocuments({})
}

module.exports = {
  create,
  findByReporterAndTarget,
  countByTarget,
  listReports,
  resolve,
  countAll,
}
