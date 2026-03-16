const profileRepository = require('../repositories/profile.repository')
const userRepository = require('../repositories/user.repository')
const { notFound } = require('../utils/httpError')

function buildDefaultPersonalInfo(user, isRecruiter) {
  return {
    id: isRecruiter ? `REC-${String(user._id).slice(-5)}` : `USR-${String(user._id).slice(-5)}`,
    isVerified: false,
    fullName: user.fullName || '',
    role: isRecruiter ? 'Nhà tuyển dụng' : '',
    dob: '',
    phone: '',
    email: user.email || '',
    address: '',
    summary: '',
    avatarUrl: '',
    coverUrl: '',
    github: '',
    linkedin: '',
    portfolio: '',
  }
}

function mapProfileResponse(profile) {
  return {
    personalInfo: profile.personalInfo,
    companyInfo: profile.companyInfo,
    skills: profile.skills || [],
    experiences: profile.experiences || [],
    educations: profile.educations || [],
    socialLinks: profile.socialLinks || {
      github: '',
      linkedin: '',
      portfolio: '',
    },
    projects: profile.projects || [],
    languages: profile.languages || [],
    certifications: profile.certifications || [],
    activities: profile.activities || [],
    hobbies: profile.hobbies || [],
  }
}

async function getMyProfile(userId) {
  const user = await userRepository.findByIdLean(userId)
  if (!user) throw notFound('Không tìm thấy user')

  let profile = await profileRepository.findByUserIdLean(userId)
  if (!profile) {
    const isRecruiter = user.role === 'recruiter'
    const created = await profileRepository.create({
      userId: user._id,
      personalInfo: buildDefaultPersonalInfo(user, isRecruiter),
      companyInfo: {
        companyName: '',
        website: '',
        size: '',
        address: '',
        description: '',
      },
      skills: [],
      experiences: [],
      educations: [],
      socialLinks: {
        github: '',
        linkedin: '',
        portfolio: '',
      },
      projects: [],
      languages: [],
      certifications: [],
      activities: [],
      hobbies: [],
    })
    profile = created.toObject()
  }

  return mapProfileResponse(profile)
}

async function saveMyProfile(userId, payload) {
  const profile = await profileRepository.upsertByUserId(userId, {
    personalInfo: payload.personalInfo,
    companyInfo: payload.companyInfo,
    skills: payload.skills,
    experiences: payload.experiences,
    educations: payload.educations,
    socialLinks: payload.socialLinks,
    projects: payload.projects,
    languages: payload.languages,
    certifications: payload.certifications,
    activities: payload.activities,
    hobbies: payload.hobbies,
  })
  return mapProfileResponse(profile)
}

module.exports = { getMyProfile, saveMyProfile }
