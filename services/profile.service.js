const profileRepository = require('../repositories/profile.repository')
const userRepository = require('../repositories/user.repository')
const { notFound } = require('../utils/httpError')

function buildDefaultPersonalInfo(user, isRecruiter) {
  return {
    id: isRecruiter ? `REC-${String(user._id).slice(-5)}` : `USR-${String(user._id).slice(-5)}`,
    isVerified: !!user.isVerified,
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
  const socialLinks = {
    github: profile.socialLinks?.github || profile.personalInfo?.github || '',
    linkedin: profile.socialLinks?.linkedin || profile.personalInfo?.linkedin || '',
    portfolio: profile.socialLinks?.portfolio || profile.personalInfo?.portfolio || '',
  }
  return {
    personalInfo: {
      ...profile.personalInfo,
      github: socialLinks.github,
      linkedin: socialLinks.linkedin,
      portfolio: socialLinks.portfolio,
    },
    companyInfo: profile.companyInfo,
    skills: profile.skills || [],
    experiences: profile.experiences || [],
    educations: profile.educations || [],
    socialLinks,
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

  // Keep profile personal info in sync with authoritative user fields.
  const syncedPersonalInfo = {
    ...(profile.personalInfo || {}),
    isVerified: !!user.isVerified,
    fullName: user.fullName || profile.personalInfo?.fullName || '',
    email: user.email || profile.personalInfo?.email || '',
  }
  profile = await profileRepository.upsertByUserId(userId, {
    personalInfo: syncedPersonalInfo,
  })

  return mapProfileResponse(profile)
}

async function saveMyProfile(userId, payload) {
  const user = await userRepository.findByIdLean(userId)
  if (!user) throw notFound('Không tìm thấy user')

  // Update user collection for fields that are also used by auth/login flow.
  const nextFullName = payload?.personalInfo?.fullName ?? user.fullName
  const nextEmail = payload?.personalInfo?.email ?? user.email
  if (nextFullName !== user.fullName || nextEmail !== user.email) {
    await userRepository.updateById(userId, {
      fullName: nextFullName,
      email: nextEmail,
    })
  }

  const nextSocialLinks = {
    github: payload?.socialLinks?.github ?? payload?.personalInfo?.github ?? '',
    linkedin: payload?.socialLinks?.linkedin ?? payload?.personalInfo?.linkedin ?? '',
    portfolio: payload?.socialLinks?.portfolio ?? payload?.personalInfo?.portfolio ?? '',
  }

  const mergedPersonalInfo = {
    ...(payload.personalInfo || {}),
    isVerified: !!user.isVerified,
    fullName: nextFullName,
    email: nextEmail,
    github: nextSocialLinks.github,
    linkedin: nextSocialLinks.linkedin,
    portfolio: nextSocialLinks.portfolio,
  }

  const profile = await profileRepository.upsertByUserId(userId, {
    personalInfo: mergedPersonalInfo,
    companyInfo: payload.companyInfo,
    skills: payload.skills,
    experiences: payload.experiences,
    educations: payload.educations,
    socialLinks: nextSocialLinks,
    projects: payload.projects,
    languages: payload.languages,
    certifications: payload.certifications,
    activities: payload.activities,
    hobbies: payload.hobbies,
  })
  return mapProfileResponse(profile)
}

async function submitRecruiterVerificationRequest(userId, payload) {
  const user = await userRepository.findByIdLean(userId)
  if (!user) throw notFound('Không tìm thấy user')
  if (user.role !== 'recruiter') throw notFound('Chỉ nhà tuyển dụng mới có thể gửi yêu cầu duyệt')

  const note = String(payload?.note || '').trim()
  const evidenceImages = Array.isArray(payload?.evidenceImages)
    ? payload.evidenceImages.map((item) => String(item || '').trim()).filter(Boolean)
    : []

  await userRepository.updateById(userId, {
    verificationRequestNote: note,
    verificationEvidenceImages: evidenceImages,
    verificationRequestedAt: new Date(),
  })

  return {
    message: 'Đã gửi yêu cầu duyệt tài khoản nhà tuyển dụng',
    verificationRequestNote: note,
    verificationEvidenceImages: evidenceImages,
  }
}

module.exports = { getMyProfile, saveMyProfile, submitRecruiterVerificationRequest }
