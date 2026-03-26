const profileService = require('../services/profile.service')

async function getMyProfile(req, res) {
  const data = await profileService.getMyProfile(req.userId)
  res.json(data)
}

async function saveMyProfile(req, res) {
  const data = await profileService.saveMyProfile(req.userId, req.body || {})
  res.json(data)
}

async function submitRecruiterVerificationRequest(req, res) {
  const data = await profileService.submitRecruiterVerificationRequest(req.userId, req.body || {})
  res.json(data)
}

module.exports = { getMyProfile, saveMyProfile, submitRecruiterVerificationRequest }
