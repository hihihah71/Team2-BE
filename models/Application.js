const mongoose = require('mongoose')
const { APPLICATION_STATUSES } = require('../constants/domain')

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    interviewDate: { type: Date },
    interviewLocation: { type: String },
    cvId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cv', default: null },
    cvSource: {
      type: String,
      enum: ['uploaded_cv', 'profile_default'],
      default: 'uploaded_cv',
    },
    profileCvSnapshot: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      summary: { type: String, default: '' },
      skills: [{ type: String }],
      educations: [{ type: mongoose.Schema.Types.Mixed }],
      experiences: [{ type: mongoose.Schema.Types.Mixed }],
      projects: [{ type: mongoose.Schema.Types.Mixed }],
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUSES),
      default: APPLICATION_STATUSES.PENDING,
    },
    rejectedBy: {
      type: String,
      enum: ['student', 'recruiter', null],
      default: null,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(APPLICATION_STATUSES),
          required: true,
        },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    coverLetter: { type: String, default: '' },
    recruiterNotes: { type: String, default: '' },
  },
  { timestamps: true },
)

applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true })
applicationSchema.index({ applicantId: 1, createdAt: -1 })
applicationSchema.index({ jobId: 1, status: 1 })

module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema)