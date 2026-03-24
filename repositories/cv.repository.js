const Cv = require('../models/Cv')

function listByUserId(userId) {
  return Cv.find({ userId })
    .select('-fileData')
    .sort({ isDefault: -1, createdAt: -1 })
    .lean()
}

function clearDefaultByUserId(userId) {
  return Cv.updateMany({ userId }, { isDefault: false })
}

function create(payload) {
  return Cv.create(payload)
}

function findOwnedCv(cvId, userId) {
  return Cv.findOne({ _id: cvId, userId })
}

function findById(cvId) {
  return Cv.findById(cvId)
}

function deleteOwnedCv(cvId, userId) {
  return Cv.findOneAndDelete({ _id: cvId, userId })
}

function listByUserIdLean(userId) {
  return Cv.find({ userId }).select('-fileData').lean()
}

function findBySlug(slug) {
  return Cv.findOne({ slug, isPublic: true }).select('-fileData')
}

function incrementViewCount(slug) {
  return Cv.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } }, { new: true })
}

module.exports = {
  listByUserId,
  clearDefaultByUserId,
  create,
  findOwnedCv,
  findById,
  deleteOwnedCv,
  listByUserIdLean,
  findBySlug,
  incrementViewCount,
}
