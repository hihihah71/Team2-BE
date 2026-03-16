const express = require('express')
const applicationsController = require('../controllers/applications.controller')
const { auth, requireRole } = require('../middleware/auth')
const { validateBody } = require('../middleware/validate')
const { validateApply, validateStatusUpdate } = require('../validators/applications.validators')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router({ mergeParams: true })

router.get('/me', auth, requireRole('student'), asyncHandler(applicationsController.getMyApplications))
router.post(
  '/',
  auth,
  requireRole('student'),
  validateBody(validateApply),
  asyncHandler(applicationsController.apply),
)
router.get(
  '/by-job/:jobId',
  auth,
  requireRole('recruiter'),
  asyncHandler(applicationsController.getApplicantsByJob),
)
router.get(
  '/by-job/:jobId/:applicantId',
  auth,
  requireRole('recruiter'),
  asyncHandler(applicationsController.getApplicantByJob),
)
router.patch(
  '/:id',
  auth,
  requireRole('recruiter'),
  validateBody(validateStatusUpdate),
  asyncHandler(applicationsController.updateStatus),
)
router.patch(
  '/:id/reject-self',
  auth,
  requireRole('student'),
  asyncHandler(applicationsController.rejectMyApplication),
)

module.exports = router
