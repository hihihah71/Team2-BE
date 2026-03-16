const User = require('../models/User')

function findByEmail(email) {
  return User.findOne({ email })
}

function createUser(payload) {
  return User.create(payload)
}

function findByIdWithoutPassword(id) {
  return User.findById(id).select('-passwordHash')
}

function updateById(id, update) {
  return User.findByIdAndUpdate(id, update, { new: true, runValidators: true }).select(
    '-passwordHash',
  )
}

function findByIdLean(id) {
  return User.findById(id).lean()
}

module.exports = {
  findByEmail,
  createUser,
  findByIdWithoutPassword,
  updateById,
  findByIdLean,
}
