const jobRepository = require('../repositories/job.repository')
const savedJobRepository = require('../repositories/savedJob.repository')

async function getMySavedJobs(req, res) {
  const ids = await savedJobRepository.findSavedJobIdsByUser(req.userId)
  const jobs = ids.length ? await Promise.all(ids.map((id) => jobRepository.findByIdLean(id))) : []
  res.json(jobs.filter(Boolean))
}

module.exports = { getMySavedJobs }
