const express = require('express');
const router = express.Router();

// Chatbot responses database
const chatbotKB = {
  greeting: {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
    responses: [
      'Hello! 👋 Welcome to Digital Complaint System. How can I help you today?',
      'Hi there! 😊 I\'m here to assist you with complaint registration and tracking.',
      'Greetings! How can I assist you today?'
    ]
  },
  help: {
    keywords: ['help', 'how', 'guide', 'assist', 'support', 'what can you do'],
    responses: [
      'I can help you with:\n• Submitting complaints\n• Tracking complaint status\n• Finding complaint categories\n• Understanding the complaint process\n\nWhat would you like to know?',
      'Here\'s what I can assist with:\n• 📝 Submit a new complaint\n• 📊 Track existing complaints\n• 📋 Browse complaint categories\n• ❓ Answer your questions\n\nWhat interests you?'
    ]
  },
  submit: {
    keywords: ['submit', 'complaint', 'report', 'file', 'lodge', 'create complaint'],
    responses: [
      'To submit a complaint:\n1. Click "Report Issue" in the menu\n2. Select domain (Public/College/Company)\n3. Choose category & priority\n4. Add title, description, and location\n5. Attach evidence photos (optional)\n6. Click Submit!\n\nEach complaint gets a unique ID for tracking.',
      'Submitting a complaint is easy!\n✅ Go to "Report Issue"\n✅ Fill in details\n✅ Attach photos (optional)\n✅ Submit\n\nYou\'ll receive a complaint ID to track progress.'
    ]
  },
  track: {
    keywords: ['track', 'status', 'where', 'progress', 'check complaint', 'complaint status'],
    responses: [
      'To track your complaint:\n1. Go to "Complaints" section\n2. View all your submitted complaints\n3. Click on any complaint to see:\n   • Current status\n   • Status history\n   • Updates from authorities\n   • SLA deadline\n\nStatuses: Submitted → Under Review → In Progress → Resolved',
      'Tracking your complaint:\n📍 Open "Complaints" menu\n📍 Select your complaint\n📍 See real-time status updates\n📍 View timeline of actions\n\nYou can also see estimated resolution date!'
    ]
  },
  categories: {
    keywords: ['categories', 'category', 'what types', 'types of complaints', 'what can i report'],
    responses: [
      'Complaint categories available:\n\n🌍 PUBLIC:\nRoads, Water, Electricity, Garbage, Street Lights, Sexual Harassment, Cyber Crime, etc.\n\n🏫 COLLEGE:\nWiFi, Hostel, Academic, Infrastructure, Exams\n\n🏢 COMPANY:\nHR, Technical, Payroll, Workplace Issues\n\nChoose the one that fits your issue best!',
      'We handle complaints in 3 domains:\n\nPublic (civic issues) 🌍\nCollege (academic issues) 🏫\nCompany (workplace issues) 🏢\n\nEach has specific categories. Pick what matches your complaint!'
    ]
  },
  registration: {
    keywords: ['register', 'sign up', 'create account', 'register account', 'new account'],
    responses: [
      'To register:\n1. Click "Create Account" on login page\n2. Enter: Name, Email, Password\n3. Choose primary domain\n4. Click "Create Account"\n\nYou\'ll be logged in immediately and can start submitting complaints!',
      'Registration steps:\n✅ Click "Create Account"\n✅ Fill email & password\n✅ Choose your domain\n✅ Done!\n\nThen login and start reporting issues.'
    ]
  },
  login: {
    keywords: ['login', 'log in', 'sign in', 'access', 'enter', 'password'],
    responses: [
      'To login:\n1. Enter your registered email\n2. Enter your password\n3. Click "LOGIN →"\n\nIf you forgot your password, contact support.\nNo registered? Create a new account!',
      'Login is simple:\n📧 Enter email\n🔑 Enter password\n✅ Click LOGIN\n\nDon\'t have account? Register now!'
    ]
  },
  priority: {
    keywords: ['priority', 'urgent', 'critical', 'high', 'low', 'medium'],
    responses: [
      'Complaint Priority Levels:\n\n🔴 CRITICAL: Life-threatening, immediate action needed (1-day SLA)\n\n🟠 HIGH: Serious issue, major disruption (3-day SLA)\n\n🟡 MEDIUM: Moderate issue, some impact (7-day SLA)\n\n🟢 LOW: Minor issue, general inconvenience (14-day SLA)\n\nAI auto-detects priority, but you can override it!'
    ]
  },
  sla: {
    keywords: ['sla', 'deadline', 'timeline', 'resolution time', 'how long'],
    responses: [
      'SLA (Service Level Agreement) = Resolution deadline:\n\n⏱️ Critical: 1 day\n⏱️ High: 3 days\n⏱️ Medium: 7 days\n⏱️ Low: 14 days\n\nDeadlines start from submission date. Track progress in "Complaints" section!',
      'Each complaint has a deadline:\n\n🚨 Critical → 24 hours\n⚠️ High → 3 days\n📌 Medium → 7 days\n💤 Low → 14 days\n\nAim is to resolve within SLA!'
    ]
  },
  voting: {
    keywords: ['vote', 'upvote', 'support', 'like', 'boost complaint'],
    responses: [
      'Voting on complaints:\n✅ See a similar issue? Vote for it!\n✅ Each vote increases visibility\n✅ More votes = Higher priority\n✅ Help community issues get faster resolution\n\nVote in "Complaints" section by clicking the vote button!'
    ]
  },
  ai: {
    keywords: ['ai', 'analysis', 'automatic', 'detect', 'smart'],
    responses: [
      'Our AI Assistant does:\n\n🤖 Auto-categorize your complaint\n🤖 Detect priority level\n🤖 Find duplicate complaints\n🤖 Show confidence score\n🤖 Suggest keywords\n\nNo API needed - works locally! Just start typing your complaint title.',
      'AI features:\n✨ Smart category detection\n✨ Auto priority assessment\n✨ Duplicate check\n✨ Confidence scoring\n\nStarts analyzing as you type!'
    ]
  },
  admin: {
    keywords: ['admin', 'administrator', 'dashboard', 'manage', 'panel'],
    responses: [
      'Admin Panel features:\n👨‍💼 View all complaints\n👨‍💼 Assign to officers\n👨‍💼 Update status\n👨‍💼 Escalate issues\n👨‍💼 View analytics\n👨‍💼 Monitor SLA compliance\n\nAdmins have email: admin@demo.com with role-based access!'
    ]
  },
  thanks: {
    keywords: ['thank', 'thanks', 'appreciate', 'great', 'awesome', 'good job'],
    responses: [
      'You\'re welcome! 😊 Happy to help! Feel free to ask anything else.',
      'Thank you! 🙏 Is there anything else I can assist you with?',
      'My pleasure! 💪 Keep complaining (in a good way!) for better governance!'
    ]
  },
  bye: {
    keywords: ['bye', 'goodbye', 'see you', 'quit', 'exit', 'close'],
    responses: [
      'Goodbye! 👋 Feel free to return anytime. Keep complaining for a better society!',
      'See you later! 🚀 Happy complaint filing!',
      'Bye! Don\'t hesitate to come back with more questions.'
    ]
  }
};

// POST /api/chatbot/chat
router.post('/chat', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.json({ 
        reply: 'Please type a message! 😊 Ask me anything about complaints, categories, or how the system works.' 
      });
    }

    const userMsg = message.toLowerCase().trim();
    
    // Find matching knowledge base entry
    let bestMatch = null;
    let maxKeywordMatches = 0;

    for (const [category, data] of Object.entries(chatbotKB)) {
      let keywordMatches = 0;
      for (const keyword of data.keywords) {
        if (userMsg.includes(keyword)) {
          keywordMatches++;
        }
      }
      
      if (keywordMatches > maxKeywordMatches) {
        maxKeywordMatches = keywordMatches;
        bestMatch = data.responses;
      }
    }

    // If no match found, provide default response
    if (!bestMatch || maxKeywordMatches === 0) {
      const defaultResponses = [
        'That\'s an interesting question! 🤔 Can you be more specific? I can help with:\n• Submitting complaints\n• Tracking status\n• Categories & priority\n• Admin features',
        'I\'m not sure about that! 😅 Try asking me about:\n• How to submit complaints\n• How to track\n• What categories exist\n• How voting works',
        'Let me help! Ask me about:\n✅ Complaint submission\n✅ Status tracking\n✅ Complaint categories\n✅ SLA deadlines\n✅ Voting & escalation'
      ];
      const reply = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      return res.json({ reply });
    }

    // Return random response from matched category
    const reply = bestMatch[Math.floor(Math.random() * bestMatch.length)];
    res.json({ reply });

  } catch (err) {
    res.status(500).json({ 
      reply: 'Oops! Something went wrong. 😞 Please try again or contact support.' 
    });
  }
});

module.exports = router;
