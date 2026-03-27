const dashboardService = require('../services/dashboard.service')

async function getStudentDashboard(req, res) {
  const data = await dashboardService.getStudentDashboard(req.userId)
  res.json(data)
}

async function getRecruiterDashboard(req, res) {
  const data = await dashboardService.getRecruiterDashboard(req.userId)
  res.json(data)
}

const Job = require('../models/job');
const Application = require('../models/application');
const getStudentDashboardStats = async (req, res) => {
  try {
    const userId = req.userId; //

    // 1. Aggregate trend data from MongoDB
    const marketTrend = await Job.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // Groups by month number (1-12)
          newJobs: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 2. Map to Vietnamese labels to match your UI
    const monthNames = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];

    const formattedMarketTrend = marketTrend.map(item => ({
      month: monthNames[item._id - 1] || `Tháng ${item._id}`,
      newJobs: item.newJobs || 0,
      applicants: Math.floor((item.newJobs || 0) * 2.5) // Multiplier for visual trend
    }));

    // 3. Return full stats object
    res.json({
      totalApplications: await Application.countDocuments({ applicantId: userId }),
      shortlisted: await Application.countDocuments({ applicantId: userId, status: 'shortlisted' }),
      marketTrend: formattedMarketTrend // This populates the right chart
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudentDashboard, getRecruiterDashboard, getStudentDashboardStats }
