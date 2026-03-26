const express = require('express')
const profileController = require('../controllers/profile.controller')
const { auth, requireRole } = require('../middleware/auth')
const { validateBody } = require('../middleware/validate')
const { validateSaveProfile } = require('../validators/profile.validators')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

router.get('/me', auth, asyncHandler(profileController.getMyProfile))
router.put('/me', auth, validateBody(validateSaveProfile), asyncHandler(profileController.saveMyProfile))
router.patch(
  '/recruiter-verification-request',
  auth,
  requireRole('recruiter'),
  asyncHandler(profileController.submitRecruiterVerificationRequest),
)


module.exports = router

