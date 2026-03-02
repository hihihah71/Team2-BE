const mongoose = require('mongoose')

const cvSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    fileUrl: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Cv', cvSchema)
