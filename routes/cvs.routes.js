const express = require('express')
const Cv = require('../models/Cv')
const { auth, requireRole } = require('../middleware/auth')

const router = express.Router()

// GET /api/cvs/me — danh sách CV của student
router.get('/me', auth, requireRole('student'), async (req, res) => {
  try {
    const list = await Cv.find({ userId: req.userId }).sort({ isDefault: -1, createdAt: -1 }).lean()
    res.json(list)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// POST /api/cvs — thêm CV (student)
router.post('/', auth, requireRole('student'), async (req, res) => {
  try {
    const { name, fileUrl, isDefault } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Thiếu tên CV' })
    }
    if (isDefault) {
      await Cv.updateMany({ userId: req.userId }, { isDefault: false })
    }
    const cv = await Cv.create({
      userId: req.userId,
      name,
      fileUrl: fileUrl || '',
      isDefault: isDefault || false,
    })
    res.status(201).json(cv)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// PUT /api/cvs/:id — cập nhật CV hoặc đặt mặc định (student)
router.put('/:id', auth, requireRole('student'), async (req, res) => {
  try {
    const cv = await Cv.findOne({ _id: req.params.id, userId: req.userId })
    if (!cv) {
      return res.status(404).json({ message: 'Không tìm thấy CV hoặc không có quyền' })
    }
    const { name, fileUrl, isDefault } = req.body
    if (name != null) cv.name = name
    if (fileUrl != null) cv.fileUrl = fileUrl
    if (isDefault === true) {
      await Cv.updateMany({ userId: req.userId }, { isDefault: false })
      cv.isDefault = true
    } else if (isDefault === false) {
      cv.isDefault = false
    }
    await cv.save()
    res.json(cv)
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Không tìm thấy CV' })
    }
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// DELETE /api/cvs/:id — xóa CV (student)
router.delete('/:id', auth, requireRole('student'), async (req, res) => {
  try {
    const cv = await Cv.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!cv) {
      return res.status(404).json({ message: 'Không tìm thấy CV hoặc không có quyền' })
    }
    res.json({ message: 'Đã xóa CV' })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Không tìm thấy CV' })
    }
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

module.exports = router
