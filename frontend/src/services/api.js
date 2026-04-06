import axios from 'axios';

const API = axios.create({ baseURL: 'https://digitalcomplaint-api.onrender.com/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('digitalcomplaint_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('digitalcomplaint_token');
      localStorage.removeItem('digitalcomplaint_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Complaints
export const getComplaints = (params) => API.get('/complaints', { params });
export const getPublicComplaints = () => API.get('/complaints/public');
export const getComplaint = (id) => API.get(`/complaints/${id}`);
export const submitComplaint = (formData) => API.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const voteComplaint = (id) => API.post(`/complaints/${id}/vote`);
export const updateStatus = (id, data) => API.patch(`/complaints/${id}/status`, data);
export const uploadProof = (id, formData) => API.post(`/complaints/${id}/proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminComplaints = (params) => API.get('/admin/complaints', { params });
export const escalateComplaint = (id) => API.post(`/admin/complaints/${id}/escalate`);
export const assignComplaint = (id, userId) => API.patch(`/admin/complaints/${id}/assign`, { userId });

// AI
export const analyzeComplaint = (data) => API.post('/ai/analyze', data);
