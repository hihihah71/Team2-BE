const express = require('express')
const dashboardController = require('../controllers/dashboard.controller')
const { auth, requireRole } = require('../middleware/auth')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

router.get(
  '/student',
  auth,
  requireRole('student'),
  asyncHandler(dashboardController.getStudentDashboard),
)
router.get(
  '/recruiter',
  auth,
  requireRole('recruiter'),
  asyncHandler(dashboardController.getRecruiterDashboard),
)

module.exports = router

