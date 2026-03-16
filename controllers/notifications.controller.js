const notificationsService = require('../services/notifications.service')

async function getMyNotifications(req, res) {
  const data = await notificationsService.getMyNotifications(req.userId)
  res.json(data)
}

async function markAsRead(req, res) {
  const data = await notificationsService.markNotificationRead(req.params.id, req.userId)
  res.json(data)
}

module.exports = {
  getMyNotifications,
  markAsRead,
}
