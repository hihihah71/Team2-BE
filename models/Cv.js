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
  },
  { timestamps: true },
)

cvSchema.index({ userId: 1, createdAt: -1 })
cvSchema.index(
  { userId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } },
)

module.exports = mongoose.model('Cv', cvSchema)
