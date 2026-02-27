const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email đã tồn tại' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({ fullName, email, passwordHash, role })

    res.status(201).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Sai email hoặc mật khẩu' })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(400).json({ message: 'Sai email hoặc mật khẩu' })
    }

    if (role && role !== user.role) {
      return res.status(400).json({ message: 'Sai loại tài khoản' })
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    )

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

module.exports = router