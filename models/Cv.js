const mongoose = require('mongoose')

const cvSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    fileUrl: { type: String, default: '' },
    fileData: { type: Buffer, default: null },
    fileMimeType: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    // SaaS Builder fields
    cvData: { type: mongoose.Schema.Types.Mixed, default: {} },
    slug: { type: String, sparse: true }, 
    isPublic: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    parentCvId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cv', default: null },
  },
  { timestamps: true },
)

cvSchema.index({ userId: 1, createdAt: -1 })
cvSchema.index(
  { userId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } },
)
cvSchema.index({ slug: 1 }, { unique: true, sparse: true })

module.exports = mongoose.model('Cv', cvSchema)
