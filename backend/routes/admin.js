const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const submitted = await Complaint.countDocuments({ status: 'Submitted' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const escalated = await Complaint.countDocuments({ status: 'Escalated' });
    const overdueSLA = await Complaint.countDocuments({
      status: { $nin: ['Resolved', 'Rejected'] },
      'sla.deadline': { $lt: new Date() }
    });

    // Category breakdown
    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Domain breakdown
    const byDomain = await Complaint.aggregate([
      { $group: { _id: '$domain', count: { $sum: 1 } } }
    ]);

    // Priority breakdown
    const byPriority = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Daily trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyTrend = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ total, submitted, inProgress, resolved, escalated, overdueSLA, byCategory, byDomain, byPriority, dailyTrend });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/complaints — all complaints for admin
router.get('/complaints', protect, adminOnly, async (req, res) => {
  try {
    const { domain, status, priority, page = 1, limit = 50 } = req.query;
    const query = {};
    if (domain) query.domain = domain;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ complaints, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/complaints/:id/assign
router.patch('/complaints/:id/assign', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId, status: 'Under Review' },
      { new: true }
    ).populate('assignedTo', 'name email');
    res.json({ complaint, message: 'Complaint assigned' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/complaints/:id/escalate
router.post('/complaints/:id/escalate', protect, adminOnly, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    complaint.status = 'Escalated';
    complaint.sla.escalatedAt = new Date();
    complaint.statusHistory.push({ status: 'Escalated', updatedBy: req.user._id, note: 'Escalated by admin due to SLA breach' });
    await complaint.save();
    res.json({ complaint, message: 'Complaint escalated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
