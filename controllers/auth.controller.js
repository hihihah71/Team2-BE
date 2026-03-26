const authService = require('../services/auth.service')

async function register(req, res, next) {
  try {
    const data = await authService.register(req.body)
    res.status(201).json(data)
  } catch (error) {
    next(error)
  }
}

async function login(req, res, next) {
  try {
    const data = await authService.login(req.body)
    res.json(data)
  } catch (error) {
    next(error)
  }
}

async function me(req, res, next) {
  try {
    const data = await authService.getMe(req.userId)
    res.json(data)
  } catch (error) {
    next(error)
  }
}

async function updateMe(req, res, next) {
  try {
    const data = await authService.updateMe(req.userId, req.body)
    res.json(data)
  } catch (error) {
    next(error)
  }
}

async function googleLogin(req, res, next) {
  try {
    const result = await authService.googleLogin(req.body)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

async function requestVerification(req, res, next) {
  try {
    const result = await authService.requestVerification(req.userId)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

async function verifyAccount(req, res, next) {
  try {
    const { code } = req.body
    const result = await authService.verifyAccount(req.userId, code)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login, me, updateMe, googleLogin, requestVerification, verifyAccount }
