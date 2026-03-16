const cvRepository = require('../repositories/cv.repository')
const applicationRepository = require('../repositories/application.repository')
const { badRequest, notFound } = require('../utils/httpError')

function normalizePdfInput(payload) {
  if (!payload.fileDataBase64) {
    return {
      name: payload.name,
      fileData: null,
      fileMimeType: '',
      fileSize: 0,
    }
  }

  const mimeType = payload.fileMimeType || 'application/pdf'
  if (mimeType !== 'application/pdf') {
    throw badRequest('Chỉ hỗ trợ file PDF')
  }

  const cleanedBase64 = String(payload.fileDataBase64).replace(/^data:application\/pdf;base64,/, '')
  const fileBuffer = Buffer.from(cleanedBase64, 'base64')
  if (!fileBuffer.length) {
    throw badRequest('File PDF không hợp lệ')
  }
  if (fileBuffer.length > 5 * 1024 * 1024) {
    throw badRequest('File PDF tối đa 5MB')
  }

  const normalizedName = payload.name || payload.fileName || 'CV.pdf'
  return {
    name: normalizedName,
    fileData: fileBuffer,
    fileMimeType: 'application/pdf',
    fileSize: fileBuffer.length,
  }
}

function listMyCvs(userId) {
  return cvRepository.listByUserId(userId)
}

async function createCv(userId, payload) {
  const fileData = normalizePdfInput(payload)
  if (payload.isDefault) {
    await cvRepository.clearDefaultByUserId(userId)
  }
  const created = await cvRepository.create({
    userId,
    name: fileData.name,
    fileUrl: '',
    fileData: fileData.fileData,
    fileMimeType: fileData.fileMimeType,
    fileSize: fileData.fileSize,
    isDefault: payload.isDefault || false,
  })
  if (created.fileData) {
    created.fileUrl = `/api/cvs/${created._id}/file`
    await created.save()
  } else if (payload.fileUrl) {
    created.fileUrl = payload.fileUrl
    await created.save()
  }
  return created
}

async function updateCv(cvId, userId, payload) {
  const cv = await cvRepository.findOwnedCv(cvId, userId)
  if (!cv) throw notFound('Không tìm thấy CV hoặc không có quyền')

  if (payload.name != null) cv.name = payload.name
  if (payload.fileUrl != null) cv.fileUrl = payload.fileUrl
  if (payload.fileDataBase64) {
    const fileData = normalizePdfInput(payload)
    cv.name = fileData.name
    cv.fileData = fileData.fileData
    cv.fileMimeType = fileData.fileMimeType
    cv.fileSize = fileData.fileSize
    cv.fileUrl = `/api/cvs/${cv._id}/file`
  }

  if (payload.isDefault === true) {
    await cvRepository.clearDefaultByUserId(userId)
    cv.isDefault = true
  } else if (payload.isDefault === false) {
    cv.isDefault = false
  }

  await cv.save()
  return cv
}

async function getCvFileByAccess(cvId, userId, role) {
  const cv = await cvRepository.findById(cvId)
  if (!cv) throw notFound('Không tìm thấy CV')

  const isOwner = String(cv.userId) === String(userId)
  if (role === 'student' && !isOwner) {
    throw notFound('Không tìm thấy CV hoặc không có quyền')
  }

  if (role === 'recruiter') {
    const application = await applicationRepository.findOneByCvId(cvId)
    const recruiterId = application?.jobId?.recruiterId
    if (!application || String(recruiterId) !== String(userId)) {
      throw notFound('Không tìm thấy CV hoặc không có quyền')
    }
  }

  if (role !== 'student' && role !== 'recruiter') {
    throw notFound('Không tìm thấy CV hoặc không có quyền')
  }

  if (!cv.fileData || !cv.fileMimeType) {
    throw notFound('CV này không có file PDF đã upload')
  }
  return {
    buffer: cv.fileData,
    mimeType: cv.fileMimeType,
    name: cv.name || 'CV.pdf',
  }
}

async function deleteCv(cvId, userId) {
  const deleted = await cvRepository.deleteOwnedCv(cvId, userId)
  if (!deleted) throw notFound('Không tìm thấy CV hoặc không có quyền')
  return { message: 'Đã xóa CV' }
}

module.exports = { listMyCvs, createCv, updateCv, deleteCv, getCvFileByAccess }
