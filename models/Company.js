const mongoose = require('mongoose')

const companySchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    website: { type: String, default: '' },
    size: { type: String, default: '' },
    industry: { type: String, default: '' },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
  },
  { timestamps: true },
)

companySchema.index({ ownerUserId: 1 })
companySchema.index({ name: 'text' })

module.exports = mongoose.model('Company', companySchema)
