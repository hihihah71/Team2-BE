const authService = require('../services/auth.service')

async function register(req, res) {
  const data = await authService.register(req.body)
  res.status(201).json(data)
}

async function login(req, res) {
  const data = await authService.login(req.body)
  res.json(data)
}

async function me(req, res) {
  const data = await authService.getMe(req.userId)
  res.json(data)
}

async function updateMe(req, res) {
  const data = await authService.updateMe(req.userId, req.body)
  res.json(data)
}

module.exports = { register, login, me, updateMe }
