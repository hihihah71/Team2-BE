const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const userRepository = require('../repositories/user.repository')
const { badRequest, notFound } = require('../utils/httpError')
const User = require('../models/User')


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function toUserResponse(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isVerifiedRecruiter: user.isVerifiedRecruiter || false,
    verificationStep: user.verificationStep || 'none'
  }
}

async function register({ fullName, email, password, role }) {
  const existing = await userRepository.findByEmail(email)
  if (existing) {
    throw badRequest('Email đã tồn tại', 'EMAIL_EXISTS')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  
  const user = await userRepository.createUser({ 
    fullName, 
    email, 
    passwordHash, 
    role,
    verificationStep: role === 'recruiter' ? 'none' : 'approved' 
  })
  
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

  // UPDATED JWT: Include verification flags so middleware can read them without DB queries
  const token = jwt.sign(
    { 
      userId: user._id, 
      role: user.role, 
      isVerifiedRecruiter: user.isVerifiedRecruiter,
      verificationStep: user.verificationStep 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  )

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

    const emailNormalized = email.toLowerCase().trim()

    let user = await userRepository.findByEmail(emailNormalized)

    // 🆕 First login
    if (!user) {
      if (!role) {
        throw badRequest(
          'Vui lòng chọn vai trò cho lần đăng nhập đầu tiên.',
          'ROLE_REQUIRED'
        )
      }

      user = await userRepository.createUser({
        fullName: name,
        email: emailNormalized,
        role,
        googleId,
        passwordHash: 'GOOGLE_OAUTH',

        isEmailVerified: true,
        isVerified: false,
        verificationStatus: role === 'recruiter' ? 'none' : 'approved'
      })
    } 
    else {
      // 🚫 BLOCK ROLE SWITCHING
      if (role && user.role !== role) {
        throw badRequest(
          'Bạn không thể thay đổi vai trò sau khi đã đăng ký.',
          'ROLE_LOCKED'
        )
      }

      // 🧠 Backward compatibility
      if (user.role === 'recruiter' && user.isVerified === undefined) {
        user.isVerified = false
        user.verificationStatus = 'none'
        await user.save()
      }
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return {
      token,
      user: toUserResponse(user),

      needsVerification:
        user.role === 'recruiter' &&
        user.verificationStatus !== 'approved'
    }

  } catch (error) {
    console.error('Google Auth Error:', error)
    if (error.status === 400) throw error
    throw badRequest('Xác thực Google thất bại', 'GOOGLE_AUTH_FAILED')
  }
}

async function requestVerification(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw notFound('Không tìm thấy người dùng');

  // Rate limiting: 60 seconds
  if (user.lastResendAt && Date.now() - new Date(user.lastResendAt).getTime() < 60000) {
    throw badRequest('Vui lòng đợi 60 giây trước khi yêu cầu mã mới.');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60000); // 10 minutes

  await userRepository.updateById(userId, {
    verificationCode: code,
    verificationCodeExpires: expires,
    lastResendAt: new Date(),
  });

  const emailService = require('./email.service');
  await emailService.sendOTP(user.email, code);

  return { message: 'Mã OTP đã được gửi đến email của bạn.' };
}

async function verifyAccount(userId, code) {
  const user = await userRepository.findById(userId);
  if (!user) throw notFound('Không tìm thấy người dùng');

  if (!user.verificationCode || user.verificationCode !== code) {
    throw badRequest('Mã OTP không chính xác.');
  }

  if (new Date(user.verificationCodeExpires) < new Date()) {
    throw badRequest('Mã OTP đã hết hạn.');
  }

  await userRepository.updateById(userId, {
    isVerified: true,
    verificationCode: null,
    verificationCodeExpires: null,
  });

  return { message: 'Tài khoản đã được xác thực thành công.', isVerified: true };
}

module.exports = { register, login, getMe, updateMe, googleLogin, requestVerification, verifyAccount }