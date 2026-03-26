const express = require('express')
const authController = require('../controllers/auth.controller')
const { auth } = require('../middleware/auth')
const { validateBody } = require('../middleware/validate')
const { validateLogin, validateRegister } = require('../validators/auth.validators')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

router.post('/register', validateBody(validateRegister), asyncHandler(authController.register))
router.post('/login', validateBody(validateLogin), asyncHandler(authController.login))
router.post('/google', asyncHandler(authController.googleLogin))
router.get('/me', auth, authController.me)
router.patch('/me', auth, authController.updateMe)

// OTP Verification
router.post('/request-verification', auth, asyncHandler(authController.requestVerification))
router.post('/verify-account', auth, asyncHandler(authController.verifyAccount))

module.exports = router