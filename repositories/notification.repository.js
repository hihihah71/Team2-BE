const Notification = require('../models/Notification')

function create(payload) {
  return Notification.create(payload)
}

function listByUserId(userId) {
  return Notification.find({ userId }).sort({ createdAt: -1 }).lean()
}

function markAsRead(notificationId, userId) {
  return Notification.findOneAndUpdate(
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
