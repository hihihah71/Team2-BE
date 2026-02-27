const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'recruiter'], required: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('User', userSchema)