const Notification = require('../models/Notification')

// Đảm bảo chỉ định nghĩa một lần và có đầy đủ async/await
async function create(payload) {
  return await Notification.create(payload)
}

async function listByUserId(userId) {
  console.log("FETCH notifications for user:", userId);
  return await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .lean()
}

async function markAsRead(notificationId, userId) {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true },
  ).lean()
}

module.exports = {
  create,
  listByUserId,
  markAsRead,
}