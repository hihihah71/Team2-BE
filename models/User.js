const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'recruiter', 'admin'], required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    lastResendAt: { type: Date },
    isVerifiedRecruiter: { type: Boolean, default: false },
    verificationRequestNote: { type: String, default: '' },
    verificationEvidenceImages: [{ type: String }],
    verificationRequestedAt: { type: Date, default: null },
    verificationRejectReason: { type: String, default: '' },
    isBanned: { type: Boolean, default: false },
    bannedReason: { type: String, default: '' },
    bannedAt: { type: Date, default: null },
    bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
)

userSchema.index({ role: 1, createdAt: -1 })

module.exports = mongoose.model('User', userSchema)