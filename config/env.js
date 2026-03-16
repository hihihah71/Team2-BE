const requiredVariables = ['MONGO_URI', 'JWT_SECRET']

function validateEnv() {
  const missing = requiredVariables.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

module.exports = { validateEnv }
