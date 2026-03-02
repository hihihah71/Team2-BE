const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    requirements: { type: String, default: '' },
    experienceYears: { type: Number, default: null },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    deadline: { type: Date, default: null },
    status: { type: String, enum: ['draft', 'open', 'closed'], default: 'open' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Job', jobSchema)
