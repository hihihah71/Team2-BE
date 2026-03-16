const { badRequest } = require('../utils/httpError')

function validateBody(validator) {
  return (req, res, next) => {
    const message = validator(req.body || {})
    if (message) {
      return next(badRequest(message, 'VALIDATION_ERROR'))
    }
    return next()
  }
}

module.exports = { validateBody }
