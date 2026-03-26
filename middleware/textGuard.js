const { badRequest } = require('../utils/httpError')

const DEFAULT_SKIP_KEY_PATTERN =
  /(token|password|email|url|uri|link|base64|image|avatar|cover|otp|code|phone|jwt)/i

const FIELD_RULES = [
  { pathPattern: /fullName|name$/i, maxWords: 8, maxWordLength: 20 },
  { pathPattern: /title$/i, maxWords: 16, maxWordLength: 24 },
  { pathPattern: /company|organization/i, maxWords: 12, maxWordLength: 24 },
  { pathPattern: /location|address/i, maxWords: 30, maxWordLength: 30 },
  { pathPattern: /summary|about/i, maxWords: 120, maxWordLength: 24 },
  { pathPattern: /description|requirements|responsibilit|achievement/i, maxWords: 350, maxWordLength: 28 },
  { pathPattern: /skill|keyword|tag/i, maxWords: 60, maxWordLength: 24 },
  { pathPattern: /jobDescription|jdText/i, maxWords: 500, maxWordLength: 30 },
  { pathPattern: /prompt|question|answer|message|content/i, maxWords: 400, maxWordLength: 30 },
]

function countWords(text) {
  const normalized = String(text || '').trim()
  if (!normalized) return 0
  return normalized.split(/\s+/).length
}

function hasOverlongWord(text, maxWordLength) {
  const normalized = String(text || '').trim()
  if (!normalized) return false
  return normalized.split(/\s+/).some((word) => word.length > maxWordLength)
}

function createTextGuard(options = {}) {
  const maxWords = options.maxWords || 300
  const maxWordLength = options.maxWordLength || 20
  const skipKeyPattern = options.skipKeyPattern || DEFAULT_SKIP_KEY_PATTERN
  const resolveRule = (path) => {
    const rule = FIELD_RULES.find((item) => item.pathPattern.test(path))
    return {
      maxWords: (rule && rule.maxWords) || maxWords,
      maxWordLength: (rule && rule.maxWordLength) || maxWordLength,
    }
  }

  const walk = (value, path, key) => {
    if (value == null) return null

    if (typeof value === 'string') {
      if (key && skipKeyPattern.test(key)) return null
      const rule = resolveRule(path)
      if (countWords(value) > rule.maxWords) {
        return `Truong ${path} vuot qua gioi han ${rule.maxWords} tu.`
      }
      if (hasOverlongWord(value, rule.maxWordLength)) {
        return `Truong ${path} co tu dai hon ${rule.maxWordLength} ky tu.`
      }
      return null
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i += 1) {
        const error = walk(value[i], `${path}[${i}]`, key)
        if (error) return error
      }
      return null
    }

    if (typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value)) {
        const childPath = path ? `${path}.${childKey}` : childKey
        const error = walk(childValue, childPath, childKey)
        if (error) return error
      }
    }

    return null
  }

  return (req, res, next) => {
    const method = req.method.toUpperCase()
    if (!['POST', 'PUT', 'PATCH'].includes(method)) return next()

    const error = walk(req.body, 'body')
    if (error) return next(badRequest(error, 'TEXT_VALIDATION_ERROR'))
    return next()
  }
}

module.exports = { createTextGuard }
