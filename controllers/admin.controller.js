const User = require('../models/User')
const { notFound } = require('../utils/httpError')

async function listUsers(req, res) {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean()
  res.json(users)
}

async function verifyRecruiter(req, res) {
  const { userId } = req.params
  const { isVerified } = req.body
  
  const user = await User.findByIdAndUpdate(
    userId,
    { isVerifiedRecruiter: isVerified },
    { new: true }
  ).select('-passwordHash')

  if (!user) throw notFound('User not found')
  res.json(user)
}

module.exports = { listUsers, verifyRecruiter }
