const express = require('express')
const reportsController = require('../controllers/reports.controller')
const { auth, requireRole } = require('../middleware/auth')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

router.post('/', auth, requireRole('student'), asyncHandler(reportsController.createReport))

module.exports = router
