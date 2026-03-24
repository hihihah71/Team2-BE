const cvsService = require('../services/cvs.service')

async function getMyCvs(req, res) {
  const data = await cvsService.listMyCvs(req.userId)
  res.json(data)
}

async function createCv(req, res) {
  const data = await cvsService.createCv(req.userId, req.body)
  res.status(201).json(data)
}

async function updateCv(req, res) {
  const data = await cvsService.updateCv(req.params.id, req.userId, req.body)
  res.json(data)
}

async function deleteCv(req, res) {
  const data = await cvsService.deleteCv(req.params.id, req.userId)
  res.json(data)
}

async function getCvFile(req, res) {
  const file = await cvsService.getCvFileByAccess(req.params.id, req.userId, req.role)
  res.setHeader('Content-Type', file.mimeType)
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`)
  res.send(file.buffer)
}

async function cloneVersion(req, res) {
  const data = await cvsService.cloneVersion(req.params.id, req.userId, req.body.newName)
  res.status(201).json(data)
}

async function getPublicCv(req, res) {
  const data = await cvsService.getPublicCv(req.params.slug)
  res.json(data)
}

module.exports = { getMyCvs, createCv, updateCv, deleteCv, getCvFile, cloneVersion, getPublicCv }
