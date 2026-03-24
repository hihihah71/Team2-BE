const express = require('express')
const cvsController = require('../controllers/cvs.controller')
const { auth, requireRole } = require('../middleware/auth')
const { validateBody } = require('../middleware/validate')
const { validateCreateCv } = require('../validators/cvs.validators')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

router.get('/public/:slug', asyncHandler(cvsController.getPublicCv))
router.get('/me', auth, requireRole('student'), asyncHandler(cvsController.getMyCvs))
router.post(
  '/',
  auth,
  requireRole('student'),
  validateBody(validateCreateCv),
  asyncHandler(cvsController.createCv),
)
router.post('/:id/versions', auth, requireRole('student'), asyncHandler(cvsController.cloneVersion))
router.get('/:id/file', auth, asyncHandler(cvsController.getCvFile))
router.put('/:id', auth, requireRole('student'), asyncHandler(cvsController.updateCv))
router.delete('/:id', auth, requireRole('student'), asyncHandler(cvsController.deleteCv))

module.exports = router
