const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  description: String,
  salaryMin: Number,
  salaryMax: Number,
  experienceYears: Number,
  requirements: String,
  deadline: Date,
  status: {
    type: String,
    default: "open"
  },
  phone: String,
  imageUrl: String,
  views: {
    type: Number,
    default: 0
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true })

module.exports = mongoose.model('Job', JobSchema)