const Profile = require('../models/Profile')

function findByUserIdLean(userId) {
  return Profile.findOne({ userId }).lean()
}

function create(payload) {
  return Profile.create(payload)
}

function upsertByUserId(userId, update) {
  return Profile.findOneAndUpdate({ userId }, { $set: update }, { upsert: true, new: true }).lean()
}

module.exports = { findByUserIdLean, create, upsertByUserId }
