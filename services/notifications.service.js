const notificationRepository = require('../repositories/notification.repository')
const { notFound } = require('../utils/httpError')


async function getMyNotifications(userId) {
  return await notificationRepository.listByUserId(userId)
}

async function markNotificationRead(notificationId, userId) {
  const updated = await notificationRepository.markAsRead(notificationId, userId)
  if (!updated) {
    throw notFound('Không tìm thấy thông báo')
  }
  return updated
}

async function createNotification(payload) {
  console.log("==> Đang gọi Repository để tạo thông báo cho User:", payload.userId);
  // Hàm này bạn đã có await, rất tốt!
  return await notificationRepository.create(payload);
}

module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationRead,
}
