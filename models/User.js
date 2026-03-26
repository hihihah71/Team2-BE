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
  },
  { timestamps: true },
)

userSchema.index({ role: 1, createdAt: -1 })

module.exports = mongoose.model('User', userSchema)