const express = require('express')
const notificationsController = require('../controllers/notifications.controller')
const { auth } = require('../middleware/auth')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

router.get('/me', auth, asyncHandler(notificationsController.getMyNotifications))
router.patch('/:id/read', auth, asyncHandler(notificationsController.markAsRead))

module.exports = router
