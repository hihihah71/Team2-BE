const express = require('express')
const adminController = require('../controllers/admin.controller')
const { auth, requireRole } = require('../middleware/auth')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

router.get('/users', auth, requireRole('admin'), asyncHandler(adminController.listUsers))
router.patch('/users/:userId/verify', auth, requireRole('admin'), asyncHandler(adminController.verifyRecruiter))

module.exports = router
