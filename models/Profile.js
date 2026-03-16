const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    personalInfo: {
      id: { type: String, default: '' },
      isVerified: { type: Boolean, default: false },
      fullName: { type: String, default: '' },
      role: { type: String, default: '' },
      dob: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      summary: { type: String, default: '' },
      avatarUrl: { type: String, default: '' },
      coverUrl: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },

    companyInfo: {
      companyName: { type: String, default: '' },
      website: { type: String, default: '' },
      size: { type: String, default: '' },
      address: { type: String, default: '' },
      description: { type: String, default: '' },
    },

    skills: [{ type: String }],

    experiences: [
      {
        id: { type: mongoose.Schema.Types.Mixed },
        title: String,
        company: String,
        date: String,
        desc: String,
      },
    ],

    educations: [
      {
        id: { type: mongoose.Schema.Types.Mixed },
        title: String,
        school: String,
        date: String,
        desc: String,
      },
    ],

    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },

    projects: [
      {
        id: { type: mongoose.Schema.Types.Mixed },
        name: String,
        date: String,
        role: String,
        technologies: String,
        desc: String,
        link: String,
      },
    ],

    languages: [
      {
        id: { type: mongoose.Schema.Types.Mixed },
        name: String,
        level: String,
      },
    ],

    certifications: [
      {
        id: { type: mongoose.Schema.Types.Mixed },
        name: String,
        organization: String,
        date: String,
      },
    ],

    activities: [
      {
        id: { type: mongoose.Schema.Types.Mixed },
        name: String,
        role: String,
        date: String,
        desc: String,
      },
    ],

    hobbies: [{ type: String }],
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model('Profile', profileSchema)

