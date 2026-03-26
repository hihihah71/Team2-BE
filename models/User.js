const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },

    passwordHash: { type: String },

    role: { 
      type: String, 
      enum: ['student', 'recruiter', 'admin'], 
      required: true 
    },

    // 🔐 EMAIL VERIFICATION (for login security)
    isEmailVerified: { type: Boolean, default: false },

    // 🏢 RECRUITER VERIFICATION (MAIN LOGIC)
    isVerified: { type: Boolean, default: false },

    verificationStatus: { 
      type: String, 
      enum: ['none', 'pending', 'approved', 'rejected'], 
      default: 'none' 
    },

    companyEmail: { type: String },

    businessLicenseUrl: { type: String },

    // OTP / Email verification
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    lastResendAt: { type: Date },
  },
  { timestamps: true },
)

userSchema.index({ role: 1, createdAt: -1 })

module.exports = mongoose.model('User', userSchema)