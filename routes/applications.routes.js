const express = require('express')
const Application = require('../models/Application')
const Job = require('../models/Job')
const Cv = require('../models/Cv')
const SavedJob = require('../models/SavedJob')
const { auth, requireRole } = require('../middleware/auth')

const router = express.Router({ mergeParams: true })

// --- Student: đơn của tôi (đã apply + đã lưu) ---
// GET /api/applications/me
router.get('/me', auth, requireRole('student'), async (req, res) => {
  try {
    const [applications, savedIds] = await Promise.all([
      Application.find({ applicantId: req.userId })
        .populate('jobId', 'title company location status')
        .sort({ createdAt: -1 })
        .lean(),
      SavedJob.find({ userId: req.userId }).distinct('jobId'),
    ])
    const savedJobs = await Job.find({ _id: { $in: savedIds } }).lean()
    res.json({ applications, savedJobs })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// --- Student: nộp đơn vào job ---
// POST /api/jobs/:jobId/applications (mount trong index: router.use('/:jobId/applications', applicationsRouter) hoặc định nghĩa trong jobs)
// Để đơn giản ta tạo route applications.routes độc lập:
// POST /api/applications — body: { jobId, cvId?, coverLetter? }
router.post('/', auth, requireRole('student'), async (req, res) => {
  try {
    const { jobId, cvId, coverLetter } = req.body
    if (!jobId) {
      return res.status(400).json({ message: 'Thiếu jobId' })
    }
    const job = await Job.findById(jobId)
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' })
    }
    const existing = await Application.findOne({ jobId, applicantId: req.userId })
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã ứng tuyển tin này rồi' })
    }
    const app = await Application.create({
      jobId,
      applicantId: req.userId,
      cvId: cvId || null,
      coverLetter: coverLetter || '',
    })
    const populated = await Application.findById(app._id)
      .populate('jobId', 'title company')
      .lean()
    res.status(201).json(populated)
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Dữ liệu không hợp lệ' })
    }
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// --- Recruiter: danh sách ứng viên của một tin ---
// GET /api/jobs/:jobId/applications — cần mount trong index hoặc dùng route riêng
// Ta dùng route riêng: GET /api/applications/by-job/:jobId (recruiter)
router.get('/by-job/:jobId', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, recruiterId: req.userId })
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin hoặc không có quyền' })
    }
    const list = await Application.find({ jobId: job._id })
      .populate('applicantId', 'fullName email')
      .populate('cvId', 'name fileUrl')
      .sort({ createdAt: -1 })
      .lean()
    res.json(list)
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Không tìm thấy tin' })
    }
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// --- Recruiter: chi tiết một ứng viên (CV) ---
// GET /api/applications/by-job/:jobId/:applicantId
router.get('/by-job/:jobId/:applicantId', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, recruiterId: req.userId })
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin hoặc không có quyền' })
    }
    const app = await Application.findOne({
      jobId: req.params.jobId,
      applicantId: req.params.applicantId,
    })
      .populate('applicantId', 'fullName email')
      .populate('cvId')
      .lean()
    if (!app) {
      return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển' })
    }
    res.json(app)
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Dữ liệu không hợp lệ' })
    }
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// --- Recruiter: cập nhật trạng thái đơn (shortlist, reject, interview...) ---
// PATCH /api/applications/:id
router.patch('/:id', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate('jobId', 'recruiterId')
    if (!app || app.jobId.recruiterId.toString() !== req.userId.toString()) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hoặc không có quyền' })
    }
    const { status } = req.body
    if (status && ['pending', 'reviewing', 'shortlisted', 'interview', 'rejected', 'offered'].includes(status)) {
      app.status = status
      await app.save()
    }
    res.json(app)
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Không tìm thấy đơn' })
    }
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

module.exports = router
