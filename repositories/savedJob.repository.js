const SavedJob = require('../models/SavedJob')

function findSavedJobIdsByUser(userId) {
  return SavedJob.find({ userId }).distinct('jobId')
}

function countByUserId(userId) {
  return SavedJob.countDocuments({ userId })
}

function upsert(userId, jobId) {
  return SavedJob.findOneAndUpdate(
    { userId, jobId },
    { userId, jobId },
    { upsert: true, new: true },
  )
}

function remove(userId, jobId) {
  return SavedJob.findOneAndDelete({ userId, jobId })
}

module.exports = { findSavedJobIdsByUser, countByUserId, upsert, remove }
