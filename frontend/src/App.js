import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import ComplaintDetail from './pages/ComplaintDetail';
import SubmitComplaint from './pages/SubmitComplaint';
import AdminPanel from './pages/AdminPanel';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
};

const AppRoutes = ({ chatbotOpen, setChatbotOpen }) => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/complaints" element={<PrivateRoute><Complaints /></PrivateRoute>} />
        <Route path="/complaints/:id" element={<PrivateRoute><ComplaintDetail /></PrivateRoute>} />
        <Route path="/submit" element={<PrivateRoute><SubmitComplaint /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme="dark"
      />
      
      {/* Chatbot */}
      <Chatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
      
      {/* Floating Chatbot Button */}
      <button
        onClick={() => setChatbotOpen(!chatbotOpen)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#00ff88',
          border: '2px solid #00ff88',
          color: '#030a06',
          fontSize: 24,
          cursor: 'pointer',
          display: chatbotOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
          fontWeight: 'bold',
          zIndex: 9999,
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.8)';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.5)';
          e.target.style.transform = 'scale(1)';
        }}
        title="Chat with AI Assistant"
      >
        💬
      </button>
    </>
  );
};

const App = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  
  return (
    <Router>
      <AuthProvider>
        <AppRoutes chatbotOpen={chatbotOpen} setChatbotOpen={setChatbotOpen} />
      </AuthProvider>
    </Router>
  );
};

export default App;
