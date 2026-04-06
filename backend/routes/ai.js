const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Complaint = require('../models/Complaint');

// POST /api/ai/analyze — AI complaint analysis (keyword-based fallback + OpenAI optional)
router.post('/analyze', protect, async (req, res) => {
  try {
    const { title, description, domain } = req.body;
    const text = (title + ' ' + description).toLowerCase();

    // Keyword-based AI classification
    const categoryMap = {
      public: {
        'Roads': ['pothole', 'road', 'crack', 'damaged road', 'broken road', 'highway', 'street damage'],
        'Water Supply': ['water', 'pipe', 'leakage', 'supply', 'tap', 'drainage', 'sewage', 'flood'],
        'Electricity': ['electricity', 'power', 'outage', 'light', 'wire', 'transformer', 'blackout', 'voltage'],
        'Garbage': ['garbage', 'waste', 'trash', 'dump', 'clean', 'litter', 'sanitation'],
        'Street Lights': ['street light', 'lamp', 'dark', 'lighting', 'bulb', 'light post'],
        'Drainage': ['drain', 'clog', 'overflow', 'waterlogging', 'blocked'],
        'Sexual Harassment': ['harassment', 'assault', 'abuse', 'sexual', 'molestation', 'inappropriate', 'unwanted'],
        'Family Issues': ['family', 'domestic', 'marriage', 'divorce', 'child', 'spouse', 'parents', 'abuse'],
        'Cyber Crime': ['hacking', 'cybercrime', 'fraud', 'scam', 'phishing', 'online', 'identity theft', 'virus'],
        'Public Safety': ['crime', 'theft', 'robbery', 'violence', 'police', 'safety', 'attack', 'assault'],
        'Corruption': ['corruption', 'bribery', 'fraud', 'embezzlement', 'nepotism', 'malpractice'],
        'Labor Rights': ['labor', 'wage', 'employment', 'worker', 'strike', 'rights', 'exploitation', 'work'],
        'Healthcare': ['hospital', 'doctor', 'medical', 'health', 'medicine', 'treatment', 'health center'],
        'Environmental Issues': ['pollution', 'environment', 'waste', 'toxic', 'air', 'water quality', 'trees', 'green']
      },
      college: {
        'WiFi Issues': ['wifi', 'internet', 'network', 'connection', 'bandwidth', 'slow internet'],
        'Hostel Issues': ['hostel', 'room', 'mess', 'food', 'warden', 'dormitory'],
        'Academic Issues': ['exam', 'marks', 'attendance', 'faculty', 'professor', 'timetable', 'syllabus'],
        'Infrastructure': ['classroom', 'lab', 'equipment', 'projector', 'ac', 'fan', 'toilet', 'building'],
        'Exam Related': ['exam', 'paper', 'result', 'revaluation', 'hall ticket']
      },
      company: {
        'HR Issues': ['hr', 'leave', 'policy', 'appraisal', 'promotion', 'harassment'],
        'Technical Issues': ['server', 'system', 'software', 'hardware', 'laptop', 'vpn', 'it'],
        'Payroll Issues': ['salary', 'payroll', 'payment', 'allowance', 'reimbursement', 'pf', 'tax'],
        'Workplace Complaints': ['workplace', 'office', 'colleague', 'manager', 'behavior', 'discrimination']
      }
    };

    // Priority detection
    const urgentKw = ['accident', 'danger', 'emergency', 'fire', 'flood', 'injury', 'broken', 'severe', 'critical', 'no water', 'complete outage', 'collapse'];
    const highKw = ['weeks', 'month', 'unsafe', 'major', 'urgent', 'serious', 'not working', 'disrupted'];
    const medKw = ['issue', 'problem', 'delay', 'slow', 'pending', 'request'];

    let detectedPriority = 'Low';
    if (urgentKw.some(k => text.includes(k))) detectedPriority = 'Critical';
    else if (highKw.some(k => text.includes(k))) detectedPriority = 'High';
    else if (medKw.some(k => text.includes(k))) detectedPriority = 'Medium';

    // Category detection
    let detectedCategory = 'General';
    let maxMatches = 0;
    const cats = categoryMap[domain] || categoryMap.public;
    for (const [cat, keywords] of Object.entries(cats)) {
      const matches = keywords.filter(k => text.includes(k)).length;
      if (matches > maxMatches) { maxMatches = matches; detectedCategory = cat; }
    }

    // Duplicate detection (simple — check similar titles)
    const recent = await Complaint.find({ domain, category: detectedCategory, status: { $ne: 'Resolved' } })
      .select('complaintId title')
      .limit(20);

    let isDuplicate = false;
    let duplicateOf = null;
    for (const c of recent) {
      const overlap = title.toLowerCase().split(' ').filter(w => w.length > 3 && c.title.toLowerCase().includes(w)).length;
      if (overlap >= 3) { isDuplicate = true; duplicateOf = c.complaintId; break; }
    }

    const keywords = [...new Set(text.split(/\s+/).filter(w => w.length > 4))].slice(0, 10);

    res.json({
      detectedCategory,
      detectedPriority,
      isDuplicate,
      duplicateOf,
      confidence: maxMatches > 0 ? Math.min(0.95, 0.5 + maxMatches * 0.15) : 0.4,
      keywords,
      suggestion: isDuplicate
        ? `Similar complaint ${duplicateOf} already exists. Consider upvoting it instead.`
        : `Complaint categorized as "${detectedCategory}" with ${detectedPriority} priority.`
    });
  } catch (err) {
    res.status(500).json({ message: 'AI analysis failed', error: err.message });
  }
});

module.exports = router;
