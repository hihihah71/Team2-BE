const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cvId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cv', default: null },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'interview', 'rejected', 'offered'],
      default: 'pending',
    },
    coverLetter: { type: String, default: '' },
  },
  { timestamps: true },
)

applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true })

module.exports = mongoose.model('Application', applicationSchema)
