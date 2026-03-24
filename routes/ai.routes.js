const express = require('express')
const aiController = require('../controllers/ai.controller')
const { auth } = require('../middleware/auth')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

// ✅ Test endpoint – không cần đăng nhập (dùng để debug)
router.get('/test', asyncHandler(aiController.testAI))

// Các route cần đăng nhập
router.post('/optimize', auth, asyncHandler(aiController.optimizeText))
router.post('/analyze-job', auth, asyncHandler(aiController.analyzeJobMatch))
router.post('/tailor', auth, asyncHandler(aiController.tailorCV))
router.post('/interview-prep', auth, asyncHandler(aiController.interviewPrep))

module.exports = router
