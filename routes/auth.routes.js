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
router.get('/me', auth, asyncHandler(authController.me))
router.put('/me', auth, asyncHandler(authController.updateMe))

module.exports = router