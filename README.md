# digitalcomplaint — Digital Complaint Resolution System

> AI-powered public issue tracking with transparency, accountability & real-time resolution.

![digitalcomplaint](https://img.shields.io/badge/digitalcomplaint-AI%20Powered-00ff88?style=for-the-badge)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

## 📁 Project Structure

```
digital-complaint-system/
├── frontend/          ← React App (Port 3000)
│   ├── public/
│   └── src/
│       ├── components/   (Navbar)
│       ├── context/      (AuthContext)
│       ├── pages/        (Dashboard, Complaints, Submit, Admin, Login, Register)
│       └── services/     (API layer)
│
└── backend/           ← Node.js + Express API (Port 5000)
    ├── models/        (User, Complaint)
    ├── routes/        (auth, complaints, admin, ai)
    ├── middleware/    (auth, upload)
    └── server.js
```

---

## ⚙️ Backend Setup

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.

# Start dev server
npm run dev
```

Backend runs on: `http://localhost:5000`

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install

# Start React app
npm start
```

Frontend runs on: `http://localhost:3000`

> The frontend proxies API calls to `http://localhost:5000` automatically.

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/complaints` | List complaints (filtered) |
| GET | `/api/complaints/public` | Public complaints for map |
| POST | `/api/complaints` | Submit new complaint |
| GET | `/api/complaints/:id` | Get complaint details |
| POST | `/api/complaints/:id/vote` | Upvote/downvote |
| PATCH | `/api/complaints/:id/status` | Update status |
| POST | `/api/complaints/:id/proof` | Upload proof images |

### Admin (admin role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard analytics |
| GET | `/api/admin/complaints` | All complaints |
| POST | `/api/admin/complaints/:id/escalate` | Escalate complaint |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze` | Auto-classify complaint |

---

## 🤖 AI Features

- **Auto Categorization** — Detects category from keywords (roads, water, wifi, etc.)
- **Priority Detection** — Flags High/Critical for keywords like "accident", "danger", "no water"
- **Duplicate Detection** — Checks for similar open complaints and warns user
- **Confidence Score** — Shows how confident the AI is in its classification

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Custom CSS (neon cyberpunk theme) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| File Upload | Multer |
| Notifications | React Toastify |
| Fonts | Orbitron, Rajdhani, Share Tech Mono |

---

## 🎯 Core Features

1. **Smart Complaint Submission** — Text + image upload, AI auto-categorizes
2. **AI Engine** — Category detection, priority scoring, duplicate detection
3. **3 Domains** — Public (civic), College, Company — each with tailored categories
4. **Public Voting** — Community upvotes boost priority
5. **Status Tracking** — Submitted → In Progress → Resolved with timeline
6. **Proof of Work** — Admin uploads resolution photos for transparency
7. **SLA + Escalation** — Auto-flags overdue complaints
8. **Admin Dashboard** — Analytics, filtering, bulk actions

---

## 🎤 Demo Flow (Hackathon)

1. Register → Login as user
2. Select "Public Domain" → Submit a pothole complaint
3. Watch AI auto-categorize and assign priority
4. Go to Complaint Tracker → Upvote your issue
5. Login as Admin → View dashboard analytics
6. Update status to "In Progress" → Upload proof image
7. Complaint auto-resolves → User gets toast notification

---

## 👥 Demo Credentials

After seeding (or create manually):
- **User:** `user@demo.com` / `demo123`
- **Admin:** `admin@demo.com` / `admin123`

---

## 📝 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digitalcomplaint
JWT_SECRET=your_super_secret_key
OPENAI_API_KEY=optional_for_advanced_ai
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:3000
```

---

## 🏆 Built for Hackathon

**digitalcomplaint** brings transparency and accountability to public issue resolution. Users report problems using text or images, AI categorizes and prioritizes them, and proof-based resolution ensures issues are actually fixed — not just filed.

---

*Made with ⚡ by the digitalcomplaint team*
