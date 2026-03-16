const express = require('express')
const { auth, requireRole } = require('../middleware/auth')
const { asyncHandler } = require('../utils/asyncHandler')
const savedJobsController = require('../controllers/savedJobs.controller')

const router = express.Router()

router.get('/me', auth, requireRole('student'), asyncHandler(savedJobsController.getMySavedJobs))

module.exports = router
