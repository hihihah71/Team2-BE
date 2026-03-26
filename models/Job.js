const mongoose = require('mongoose')
const { JOB_STATUSES, JOB_MODERATION_STATUSES } = require('../constants/domain')

const jobSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    requirements: { type: String, default: '' },
    jobType: { type: String, default: '' },
    experienceLevel: { type: String, default: '' },
    currency: { type: String, default: 'VND' },
    skills: [{ type: String }],
    tags: [{ type: String }],
    experienceYears: { type: Number, default: null },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    deadline: { type: Date, default: null },
    detailViewCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    moderationStatus: {
      type: String,
      enum: Object.values(JOB_MODERATION_STATUSES),
      default: JOB_MODERATION_STATUSES.APPROVED,
    },
    status: { type: String, enum: Object.values(JOB_STATUSES), default: JOB_STATUSES.OPEN },
  },
  { timestamps: true },
)

jobSchema.index({ status: 1, createdAt: -1 })
jobSchema.index({ recruiterId: 1, createdAt: -1 })
jobSchema.index({ title: 'text', company: 'text', description: 'text' })
jobSchema.index({ tags: 1 })

module.exports = mongoose.model('Job', jobSchema)
