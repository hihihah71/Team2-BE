const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJob");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

// ======================================================
// PUBLIC JOB LIST
// ======================================================
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const { search } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: regex }, { company: regex }, { description: regex }];
    }

    const [items, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter)
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// RECRUITER JOBS
// ======================================================
router.get("/my/list", auth, requireRole("recruiter"), async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.userId }).sort({ createdAt: -1 }).lean();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// CREATE JOB
// ======================================================
router.post("/", auth, requireRole("recruiter"), async (req, res) => {
  try {
    const { title, company, location, description, requirements, experienceYears, salaryMin, salaryMax, deadline } = req.body;
    if (!title || !company) return res.status(400).json({ message: "Thiếu tiêu đề hoặc tên công ty" });

    const job = await Job.create({
      recruiter: req.userId,
      title,
      company,
      location: location || "",
      description: description || "",
      requirements: requirements || "",
      experienceYears: experienceYears ?? null,
      salaryMin: salaryMin ?? null,
      salaryMax: salaryMax ?? null,
      deadline: deadline ? new Date(deadline) : null,
      status: "open",
      views: 0
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// INCREMENT VIEW COUNT (NEW SEPARATE ROUTE)
// ======================================================
router.post("/:id/view", async (req, res) => {
  try {
    // Only increment if it's a valid ID
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.status(200).json({ message: "View updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// GET JOB BY ID (READ ONLY - NO $INC HERE)
// ======================================================
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) return res.status(404).json({ message: "Không tìm thấy tin tuyển dụng" });
    res.json(job);
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json({ message: "ID không hợp lệ" });
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// JOB STATS
// ======================================================
router.get("/:id/stats", auth, requireRole("recruiter"), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.userId });
    if (!job) return res.status(404).json({ message: "Không tìm thấy tin hoặc không có quyền" });

    const [totalApplications, shortlisted, interviews] = await Promise.all([
      Application.countDocuments({ jobId: job._id }),
      Application.countDocuments({ jobId: job._id, status: "shortlisted" }),
      Application.countDocuments({ jobId: job._id, status: "interview" })
    ]);

    res.json({
      views: job.views || 0,
      applications: totalApplications,
      shortlisted,
      interviews
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// UPDATE / DELETE / SAVE / UNSAVE
// ======================================================
router.put("/:id", auth, requireRole("recruiter"), async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate({ _id: req.params.id, recruiter: req.userId }, req.body, { new: true });
    if (!job) return res.status(404).json({ message: "Không tìm thấy tin" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, requireRole("recruiter"), async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiter: req.userId });
    if (!job) return res.status(404).json({ message: "Không tìm thấy tin" });
    res.json({ message: "Đã xóa tin" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/save", auth, requireRole("student"), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Không tìm thấy tin" });
    await SavedJob.findOneAndUpdate({ userId: req.userId, jobId: job._id }, { userId: req.userId, jobId: job._id }, { upsert: true });
    res.json({ message: "Đã lưu tin" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id/save", auth, requireRole("student"), async (req, res) => {
  try {
    await SavedJob.findOneAndDelete({ userId: req.userId, jobId: req.params.id });
    res.json({ message: "Đã bỏ lưu tin" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;