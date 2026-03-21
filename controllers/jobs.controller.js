const jobsService = require('../services/jobs.service')

async function listJobs(req, res) {
  const data = await jobsService.listJobs(req.query)
  res.json(data)
}

async function listMyJobs(req, res) {
  const jobs = await jobsService.listMyJobs(req.userId)
  res.json(jobs)
}

async function getJob(req, res) {
  const job = await jobsService.getJobDetail(req.params.id)
  res.json(job)
}

async function createJob(req, res) {
  const job = await jobsService.createJob(req.userId, req.body)
  res.status(201).json(job)
}

async function updateJob(req, res) {
  const job = await jobsService.updateJob(req.params.id, req.userId, req.body)
  res.json(job)
}

async function deleteJob(req, res) {
  const data = await jobsService.deleteJob(req.params.id, req.userId)
  res.json(data)
}

async function getJobStats(req, res) {
  const data = await jobsService.getJobStats(req.params.id, req.userId)
  res.json(data)
}

async function trackJobView(req, res) {
  const data = await jobsService.trackJobDetailView(req.params.id)
  res.json(data)
}

async function saveJob(req, res) {
  const data = await jobsService.saveJob(req.params.id, req.userId)
  res.json(data)
}

async function unsaveJob(req, res) {
  const data = await jobsService.unsaveJob(req.params.id, req.userId)
  res.json(data)
}

async function deleteMultipleJobs(req, res) {
  try {
    const { jobIds } = req.body; // Matches the key sent from frontend
    if (!jobIds || !Array.isArray(jobIds)) {
      return res.status(400).json({ message: "Invalid job IDs" });
    }
    await jobsService.deleteMultipleJobs(jobIds, req.userId);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  listJobs,
  listMyJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getJobStats,
  trackJobView,
  saveJob,
  unsaveJob,
  deleteMultipleJobs 
}