const cvRepository = require('../repositories/cv.repository')
const savedJobRepository = require('../repositories/savedJob.repository')
const jobRepository = require('../repositories/job.repository')
const applicationRepository = require('../repositories/application.repository')

async function getStudentDashboard(userId) {
  const [applications, savedCount, cvs] = await Promise.all([
    applicationRepository.listByApplicantId(userId),
    savedJobRepository.countByUserId(userId),
    cvRepository.listByUserIdLean(userId),
  ])

  const totalApplications = applications.length
  const shortlisted = applications.filter((a) => a.status === 'shortlisted').length
  const interviews = applications.filter((a) => a.status === 'interview').length
  const defaultCv = cvs.find((cv) => cv.isDefault) || null

  return {
    totalApplications,
    shortlisted,
    interviews,
    savedJobs: savedCount,
    cvsCount: cvs.length,
    defaultCvName: defaultCv ? defaultCv.name : null,
  }
}

async function getRecruiterDashboard(userId) {
  const jobs = await jobRepository.listRecruiterJobs(userId)
  const jobIds = jobs.map((job) => job._id)

  const applications =
    jobIds.length > 0 ? await applicationRepository.listByJobIds(jobIds) : []

  const totalJobs = jobs.length
  const openJobs = jobs.filter((j) => j.status === 'open').length
  const totalApplications = applications.length

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayApplications = applications.filter(
    (application) => new Date(application.createdAt).getTime() >= today.getTime(),
  ).length

  return {
    totalJobs,
    openJobs,
    totalApplications,
    todayApplications,
  }
}

module.exports = { getStudentDashboard, getRecruiterDashboard }
