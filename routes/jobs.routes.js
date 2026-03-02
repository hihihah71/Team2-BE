const express = require('express')
const Job = require('../models/Job')
const Application = require('../models/Application')
const SavedJob = require('../models/SavedJob')
const { auth, requireRole } = require('../middleware/auth')

const router = express.Router()

// --- Public (không cần auth) ---

// GET /api/jobs — danh sách tin tuyển dụng (có phân trang, tìm kiếm)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status = 'open' } = req.query
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
    const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * limitNum
    const filter = { status }
    if (search && search.trim()) {
      filter.$or = [
        { title: new RegExp(search.trim(), 'i') },
        { company: new RegExp(search.trim(), 'i') },
        { description: new RegExp(search.trim(), 'i') },
      ]
    }
    const [items, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Job.countDocuments(filter),
    ])
    res.json({ items, total })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// --- Recruiter: tin của tôi (phải đứng trước /:id) ---
router.get('/my/list', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.userId }).sort({ createdAt: -1 }).lean()
    res.json(jobs)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// GET /api/jobs/:id — chi tiết một tin (public)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean()
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' })
    }
    res.json(job)
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' })
    }
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// --- Recruiter only ---

// POST /api/jobs — tạo tin (recruiter)
router.post('/', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const { title, company, location, description, requirements, experienceYears, salaryMin, salaryMax, deadline, status } = req.body
    if (!title || !company) {
      return res.status(400).json({ message: 'Thiếu tiêu đề hoặc tên công ty' })
    }
    const job = await Job.create({
      recruiterId: req.userId,
      title,
      company,
      location: location || '',
      description: description || '',
      requirements: requirements || '',
      experienceYears: experienceYears ?? null,
      salaryMin: salaryMin ?? null,
      salaryMax: salaryMax ?? null,
      deadline: deadline ? new Date(deadline) : null,
      status: status || 'open',
    })
    res.status(201).json(job)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// PUT /api/jobs/:id — cập nhật tin (recruiter, chủ tin)
router.put('/:id', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiterId: req.userId })
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin hoặc không có quyền sửa' })
    }
    const allowed = ['title', 'company', 'location', 'description', 'requirements', 'experienceYears', 'salaryMin', 'salaryMax', 'deadline', 'status']
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        if (key === 'deadline') job[key] = req.body[key] ? new Date(req.body[key]) : null
        else job[key] = req.body[key]
      }
    })
    await job.save()
    res.json(job)
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Không tìm thấy tin' })
    }
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// DELETE /api/jobs/:id — xóa tin (recruiter)
router.delete('/:id', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiterId: req.userId })
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin hoặc không có quyền xóa' })
    }
    res.json({ message: 'Đã xóa tin' })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Không tìm thấy tin' })
    }
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// GET /api/jobs/:id/stats — thống kê tin (recruiter)
router.get('/:id/stats', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiterId: req.userId })
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin hoặc không có quyền' })
    }
    const applications = await Application.find({ jobId: job._id }).lean()
    const total = applications.length
    const byStatus = {}
    applications.forEach((a) => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1
    })
    res.json({ total, byStatus })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Không tìm thấy tin' })
    }
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// --- Student: lưu / bỏ lưu tin ---

// POST /api/jobs/:id/save — đánh dấu lưu (student)
router.post('/:id/save', auth, requireRole('student'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin' })
    }
    await SavedJob.findOneAndUpdate(
      { userId: req.userId, jobId: job._id },
      { userId: req.userId, jobId: job._id },
      { upsert: true, new: true },
    )
    res.json({ message: 'Đã lưu tin' })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Không tìm thấy tin' })
    }
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// DELETE /api/jobs/:id/save — bỏ lưu (student)
router.delete('/:id/save', auth, requireRole('student'), async (req, res) => {
  try {
    await SavedJob.findOneAndDelete({ userId: req.userId, jobId: req.params.id })
    res.json({ message: 'Đã bỏ lưu tin' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

module.exports = router
