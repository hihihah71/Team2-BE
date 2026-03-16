const express = require('express')
const profileController = require('../controllers/profile.controller')
const { auth } = require('../middleware/auth')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

router.get('/me', auth, asyncHandler(profileController.getMyProfile))
router.put('/me', auth, asyncHandler(profileController.saveMyProfile))

module.exports = router

