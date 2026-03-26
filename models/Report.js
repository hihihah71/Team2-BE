const mongoose = require('mongoose')
const { REPORT_STATUSES } = require('../constants/domain')

const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['job', 'recruiter'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUSES),
      default: REPORT_STATUSES.PENDING,
    },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
)

reportSchema.index({ targetType: 1, targetId: 1, status: 1 })
reportSchema.index({ reporterId: 1, targetType: 1, targetId: 1 }, { unique: true })

module.exports = mongoose.model('Report', reportSchema)
