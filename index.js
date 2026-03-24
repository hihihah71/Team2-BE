require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const { validateEnv } = require('./config/env')
const { requestId } = require('./middleware/requestId')
const { rateLimit } = require('./middleware/rateLimit')
const { accessLog } = require('./middleware/accessLog')
const { errorHandler } = require('./middleware/errorHandler')
const authRoutes = require('./routes/auth.routes')
const jobsRoutes = require('./routes/jobs.routes')
const applicationsRoutes = require('./routes/applications.routes')
const cvsRoutes = require('./routes/cvs.routes')
const profileRoutes = require('./routes/profile.routes')
const dashboardRoutes = require('./routes/dashboard.routes')
const savedJobsRoutes = require('./routes/savedJobs.routes')
const notificationsRoutes = require('./routes/notifications.routes')
const aiRoutes = require('./routes/ai.routes')



validateEnv()

const app = express()
app.disable('x-powered-by')
app.use(requestId)
app.use(accessLog)
app.use(rateLimit)

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(
  express.json({
    // CV PDF upload (base64) & cvData payload needs larger JSON than default 100kb.
    limit: '20mb',
  }),
)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobsRoutes)
app.use('/api/applications', applicationsRoutes)
app.use('/api/cvs', cvsRoutes)
app.use('/api/saved-jobs', savedJobsRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/ai', aiRoutes)
app.use(errorHandler)

const PORT = process.env.PORT || 3000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => console.error('Mongo error:', error))

