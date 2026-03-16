const express = require('express')
const jobsController = require('../controllers/jobs.controller')
const { auth, requireRole } = require('../middleware/auth')
const { validateBody } = require('../middleware/validate')
const { validateCreateJob, validateUpdateJob } = require('../validators/jobs.validators')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

router.get('/', asyncHandler(jobsController.listJobs))
router.get('/my/list', auth, requireRole('recruiter'), asyncHandler(jobsController.listMyJobs))
router.get('/:id', asyncHandler(jobsController.getJob))
router.post('/:id/view', asyncHandler(jobsController.trackJobView))
router.post(
  '/',
  auth,
  requireRole('recruiter'),
  validateBody(validateCreateJob),
  asyncHandler(jobsController.createJob),
)
router.put(
  '/:id',
  auth,
  requireRole('recruiter'),
  validateBody(validateUpdateJob),
  asyncHandler(jobsController.updateJob),
)
router.delete('/:id', auth, requireRole('recruiter'), asyncHandler(jobsController.deleteJob))
router.get('/:id/stats', auth, requireRole('recruiter'), asyncHandler(jobsController.getJobStats))
router.post('/:id/save', auth, requireRole('student'), asyncHandler(jobsController.saveJob))
router.delete('/:id/save', auth, requireRole('student'), asyncHandler(jobsController.unsaveJob))

module.exports = router
