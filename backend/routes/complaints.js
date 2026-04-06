const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/complaints — list (with filters)
router.get('/', protect, async (req, res) => {
  try {
    const { domain, category, status, priority, page = 1, limit = 20 } = req.query;
    const query = {};
    if (domain) query.domain = domain;
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    // Non-admin users see their own + public ones
    if (req.user.role === 'user') query.submittedBy = req.user._id;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ complaints, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch complaints', error: err.message });
  }
});

// GET /api/complaints/public — all public complaints for map view
router.get('/public', async (req, res) => {
  try {
    const complaints = await Complaint.find({ domain: 'public' })
      .select('complaintId title category location priority status voteCount createdAt')
      .sort({ voteCount: -1, createdAt: -1 })
      .limit(100);
    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/complaints/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('statusHistory.updatedBy', 'name');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/complaints — submit new complaint
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, domain, category, subCategory, address, lat, lng, priority, aiAnalysis } = req.body;
    
    // Validate required fields
    if (!title || !domain || !category || !address) {
      return res.status(400).json({ message: 'Missing required fields: title, domain, category, address' });
    }

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    // Parse AI analysis safely
    let parsedAiAnalysis = {};
    if (aiAnalysis) {
      try {
        parsedAiAnalysis = typeof aiAnalysis === 'string' ? JSON.parse(aiAnalysis) : aiAnalysis;
      } catch (parseErr) {
        console.warn('AI analysis parsing error:', parseErr.message);
      }
    }

    const complaint = await Complaint.create({
      title, description, domain, category, subCategory,
      location: { address, lat: lat ? Number(lat) : undefined, lng: lng ? Number(lng) : undefined },
      priority: priority || 'Medium',
      images,
      submittedBy: req.user._id,
      aiAnalysis: parsedAiAnalysis,
      statusHistory: [{ status: 'Submitted', updatedBy: req.user._id, note: 'Complaint submitted' }]
    });

    res.status(201).json({ complaint, message: `Complaint ${complaint.complaintId} submitted successfully` });
  } catch (err) {
    console.error('Complaint submission error:', err);
    res.status(500).json({ message: 'Failed to submit complaint', error: err.message, details: err.errors || err.toString() });
  }
});

// POST /api/complaints/:id/vote
router.post('/:id/vote', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    const idx = complaint.votes.indexOf(req.user._id);
    if (idx > -1) {
      complaint.votes.splice(idx, 1);
      complaint.voteCount = Math.max(0, complaint.voteCount - 1);
    } else {
      complaint.votes.push(req.user._id);
      complaint.voteCount += 1;
    }
    await complaint.save();
    res.json({ voteCount: complaint.voteCount, voted: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/complaints/:id/status — update status (authority/admin)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });

    complaint.status = status;
    if (status === 'Resolved') complaint.resolvedAt = new Date();
    complaint.statusHistory.push({ status, updatedBy: req.user._id, note: note || '' });
    await complaint.save();

    res.json({ complaint, message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/complaints/:id/proof — upload proof of work
router.post('/:id/proof', protect, upload.array('proofImages', 5), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    const proofImages = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    complaint.proofImages.push(...proofImages);
    complaint.status = 'Resolved';
    complaint.resolvedAt = new Date();
    complaint.statusHistory.push({ status: 'Resolved', updatedBy: req.user._id, note: 'Proof of work uploaded' });
    await complaint.save();
    res.json({ complaint, message: 'Proof uploaded, complaint resolved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
