const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const userRepository = require('../repositories/user.repository')
const { badRequest, notFound } = require('../utils/httpError')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function toUserResponse(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  }
}

async function register({ fullName, email, password, role }) {
  const existing = await userRepository.findByEmail(email)
  if (existing) {
    throw badRequest('Email đã tồn tại', 'EMAIL_EXISTS')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await userRepository.createUser({ fullName, email, passwordHash, role })
  return toUserResponse(user)
}

async function login({ email, password, role }) {
  const user = await userRepository.findByEmail(email)
  if (!user) {
    throw badRequest('Sai email hoặc mật khẩu', 'INVALID_CREDENTIALS')
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    throw badRequest('Sai email hoặc mật khẩu', 'INVALID_CREDENTIALS')
  }

  if (role && role !== user.role) {
    throw badRequest('Sai loại tài khoản', 'ROLE_MISMATCH')
  }

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })

  return { token, user: toUserResponse(user) }
}

async function getMe(userId) {
  const user = await userRepository.findByIdWithoutPassword(userId)
  if (!user) {
    throw notFound('Không tìm thấy user')
  }
  return toUserResponse(user)
}

async function updateMe(userId, payload) {
  const update = {}
  if (payload.fullName != null) update.fullName = payload.fullName
  if (payload.email != null) update.email = payload.email

  const user = await userRepository.updateById(userId, update)
  if (!user) {
    throw notFound('Không tìm thấy user')
  }
  return toUserResponse(user)
}

async function googleLogin({ idToken, role }) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const { email, name, sub: googleId } = payload

    let user = await userRepository.findByEmail(email)

    if (!user) {
      if (!role) {
        throw badRequest('Vui lòng chọn vai trò (Sinh viên/Nhà tuyển dụng) cho lần đăng nhập đầu tiên.', 'ROLE_REQUIRED')
      }
      // Create new user if not exists
      user = await userRepository.createUser({
        fullName: name,
        email,
        role,
        googleId, // Optional: save googleId for tracking
        passwordHash: 'GOOGLE_OAUTH', // Placeholder for OAuth users
      })
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    return { token, user: toUserResponse(user) }
  } catch (error) {
    console.error('Google Auth Error:', error)
    if (error.status === 400) throw error
    throw badRequest('Xác thực Google thất bại', 'GOOGLE_AUTH_FAILED')
  }
}

module.exports = { register, login, getMe, updateMe, googleLogin }
