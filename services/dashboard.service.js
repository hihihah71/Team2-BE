const cvRepository = require('../repositories/cv.repository')
const savedJobRepository = require('../repositories/savedJob.repository')
const jobRepository = require('../repositories/job.repository')
const applicationRepository = require('../repositories/application.repository')

async function getStudentDashboard(userId) {
  // 1. Fetch the base data
  const [applications, savedCount, cvs] = await Promise.all([
    applicationRepository.listByApplicantId(userId),
    savedJobRepository.countByUserId(userId),
    cvRepository.listByUserIdLean(userId),
  ])

  // 2. Filter for upcoming interviews
  const upcomingInterviewsRaw = applications.filter(app => {
    const isUpcomingStatus = ['interview', 'interview_accepted'].includes(app.status);
    // We check if interviewDate exists
    return isUpcomingStatus && app.interviewDate;
  });

const upcomingInterviews = upcomingInterviewsRaw.map(app => ({
  _id: app._id,
  jobId: app.jobId?._id || app.jobId,
  // FIX: Ensure these match your Job Model fields exactly
  jobTitle: app.jobId?.title || 'Vị trí ứng tuyển', 
  company: app.jobId?.company || 'Công ty tuyển dụng', // Changed companyName to company
  interviewDate: app.interviewDate,
  status: app.status
}));

  // 4. Calculate statistics
  const totalApplications = applications.length;
  const shortlisted = applications.filter((a) => a.status === 'shortlisted').length;
  const interviewsCount = applications.filter((a) => 
    ['interview', 'interview_accepted'].includes(a.status)
  ).length;

  const defaultCv = cvs.find((cv) => cv.isDefault) || null;

  // 5. Return everything
  return {
    totalApplications,
    shortlisted,
    interviews: interviewsCount, // This powers the "Lịch phỏng vấn" card count
    upcomingInterviews,         // This powers the "Lịch phỏng vấn sắp tới" list
    savedJobs: savedCount,
    cvsCount: cvs.length,
    defaultCvName: defaultCv ? defaultCv.name : 'Chưa chọn',
  };
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
