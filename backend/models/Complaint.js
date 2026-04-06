const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  domain: { type: String, enum: ['public', 'college', 'company'], required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  location: {
    address: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number }
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected', 'Escalated'],
    default: 'Submitted'
  },
  images: [{ type: String }],
  proofImages: [{ type: String }],
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  voteCount: { type: Number, default: 0 },
  aiAnalysis: {
    detectedCategory: String,
    detectedPriority: String,
    isDuplicate: Boolean,
    duplicateOf: String,
    confidence: Number,
    keywords: [String]
  },
  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],
  sla: {
    deadline: { type: Date },
    isOverdue: { type: Boolean, default: false },
    escalatedAt: { type: Date }
  },
  notifications: [{
    message: String,
    sentAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['email', 'push', 'sms'] }
  }],
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate complaint ID
complaintSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintId = `GS-${String(count + 1).padStart(4, '0')}`;
  }
  this.updatedAt = Date.now();
  // Auto-set SLA deadline based on priority
  if (!this.sla.deadline) {
    const days = { Critical: 1, High: 3, Medium: 7, Low: 14 };
    const d = new Date();
    d.setDate(d.getDate() + (days[this.priority] || 7));
    this.sla.deadline = d;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
