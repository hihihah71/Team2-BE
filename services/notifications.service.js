const notificationRepository = require('../repositories/notification.repository')
const { notFound } = require('../utils/httpError')

function createNotification(payload) {
  return notificationRepository.create(payload)
}

function getMyNotifications(userId) {
  return notificationRepository.listByUserId(userId)
}

async function markNotificationRead(notificationId, userId) {
  const updated = await notificationRepository.markAsRead(notificationId, userId)
  if (!updated) {
    throw notFound('Không tìm thấy thông báo')
  }
  return updated
}

module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationRead,
}
