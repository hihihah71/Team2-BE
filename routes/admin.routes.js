const express = require('express')
const adminController = require('../controllers/admin.controller')
const { auth, requireRole } = require('../middleware/auth')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

router.get('/overview', auth, requireRole('admin'), asyncHandler(adminController.getOverview))
router.get('/users', auth, requireRole('admin'), asyncHandler(adminController.listUsers))
router.patch('/users/:userId/ban', auth, requireRole('admin'), asyncHandler(adminController.banUser))
router.patch('/users/:userId/unban', auth, requireRole('admin'), asyncHandler(adminController.unbanUser))

router.get('/recruiters', auth, requireRole('admin'), asyncHandler(adminController.listRecruiters))
router.patch('/recruiters/:userId/approve', auth, requireRole('admin'), asyncHandler(adminController.approveRecruiter))
router.patch('/recruiters/:userId/reject', auth, requireRole('admin'), asyncHandler(adminController.rejectRecruiter))

router.get('/jobs', auth, requireRole('admin'), asyncHandler(adminController.listJobs))
router.get('/jobs/:jobId', auth, requireRole('admin'), asyncHandler(adminController.getJobDetail))
router.patch('/jobs/:jobId/approve', auth, requireRole('admin'), asyncHandler(adminController.approveJob))
router.patch('/jobs/:jobId/reject', auth, requireRole('admin'), asyncHandler(adminController.rejectJob))
router.patch('/jobs/:jobId/flag', auth, requireRole('admin'), asyncHandler(adminController.flagJob))
router.patch('/jobs/:jobId/ban', auth, requireRole('admin'), asyncHandler(adminController.banJob))
router.delete('/jobs/:jobId', auth, requireRole('admin'), asyncHandler(adminController.deleteJob))

router.get('/reports', auth, requireRole('admin'), asyncHandler(adminController.listReports))
router.patch('/reports/:reportId/resolve', auth, requireRole('admin'), asyncHandler(adminController.resolveReport))

module.exports = router
