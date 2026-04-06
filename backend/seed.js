// Run with: node seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/digitalcomplaint';

const userSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String, domain: String });
const complaintSchema = new mongoose.Schema({
  complaintId: String, title: String, description: String, domain: String, category: String,
  location: { address: String }, priority: String, status: String, voteCount: Number,
  submittedBy: mongoose.Schema.Types.ObjectId, images: [String], proofImages: [String],
  aiAnalysis: Object, statusHistory: [{ status: String, note: String, timestamp: Date }],
  sla: { deadline: Date, isOverdue: Boolean },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);

const SAMPLE_COMPLAINTS = [
  { complaintId: 'GS-0001', title: 'Large pothole on Main Road near Gate 2', description: 'A massive pothole has formed causing two bike accidents this week. Urgent action needed.', domain: 'public', category: 'Roads / Potholes', location: { address: 'Main Road, Near Gate 2' }, priority: 'High', status: 'In Progress', voteCount: 34 },
  { complaintId: 'GS-0002', title: 'Street light not working for 2 weeks', description: 'Complete darkness at Block-B street at night. Safety concern for residents.', domain: 'public', category: 'Street Lights', location: { address: 'Block-B, Sector 4' }, priority: 'Medium', status: 'Submitted', voteCount: 18 },
  { complaintId: 'GS-0003', title: 'Water supply disrupted since Monday', description: 'No water supply for 4 days in Sector 4. Residents are suffering.', domain: 'public', category: 'Water Supply', location: { address: 'Sector 4, Main Colony' }, priority: 'High', status: 'Resolved', voteCount: 56, proofImages: [] },
  { complaintId: 'GS-0004', title: 'WiFi not working in CS Lab Block', description: 'Internet has been down for 2 days during exam preparation period.', domain: 'college', category: 'WiFi Issues', location: { address: 'CS Department, Lab Block 2' }, priority: 'Medium', status: 'In Progress', voteCount: 29 },
  { complaintId: 'GS-0005', title: 'Garbage pile near hostel gate not cleared', description: 'Garbage has not been collected for 3 days. Foul smell affecting students.', domain: 'college', category: 'Garbage Collection', location: { address: 'Hostel A, Main Gate' }, priority: 'Low', status: 'Submitted', voteCount: 12 },
  { complaintId: 'GS-0006', title: 'Monthly salary not credited', description: 'Salary for 15 employees in Dept-B not credited this month. Finance team not responding.', domain: 'company', category: 'Payroll Issues', location: { address: 'HR Department, 3rd Floor' }, priority: 'High', status: 'Escalated', voteCount: 8 },
  { complaintId: 'GS-0007', title: 'Drainage overflow near market area', description: 'Sewage overflowing on main road causing health hazard.', domain: 'public', category: 'Drainage', location: { address: 'Market Street, Near Bus Stand' }, priority: 'Critical', status: 'Escalated', voteCount: 67 },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Complaint.deleteMany({});

  const hashedUser = await bcrypt.hash('demo123', 12);
  const hashedAdmin = await bcrypt.hash('admin123', 12);

  const [u, a] = await User.insertMany([
    { name: 'Demo User', email: 'user@demo.com', password: hashedUser, role: 'user', domain: 'public' },
    { name: 'Admin', email: 'admin@demo.com', password: hashedAdmin, role: 'admin', domain: 'public' },
  ]);

  const complaints = SAMPLE_COMPLAINTS.map(c => ({
    ...c,
    submittedBy: u._id,
    sla: { deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), isOverdue: c.status === 'Escalated' },
    statusHistory: [{ status: c.status, note: 'Demo data', timestamp: new Date() }],
    aiAnalysis: { detectedCategory: c.category, detectedPriority: c.priority, confidence: 0.87 }
  }));

  await Complaint.insertMany(complaints);

  console.log('✅ Seed complete!');
  console.log('   User: user@demo.com / demo123');
  console.log('   Admin: admin@demo.com / admin123');
  console.log(`   Complaints: ${complaints.length} sample records`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
