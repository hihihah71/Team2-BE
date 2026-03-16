class HttpError extends Error {
  constructor(statusCode, message, code) {
    super(message)
    this.statusCode = statusCode
    this.code = code || 'HTTP_ERROR'
  }
}

function badRequest(message, code = 'BAD_REQUEST') {
  return new HttpError(400, message, code)
}

function unauthorized(message, code = 'UNAUTHORIZED') {
  return new HttpError(401, message, code)
}

function forbidden(message, code = 'FORBIDDEN') {
  return new HttpError(403, message, code)
}

function notFound(message, code = 'NOT_FOUND') {
  return new HttpError(404, message, code)
}

function tooManyRequests(message, code = 'TOO_MANY_REQUESTS') {
  return new HttpError(429, message, code)
}

module.exports = {
  HttpError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
}
