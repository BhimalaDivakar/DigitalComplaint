import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', domain: 'public', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to digitalcomplaint.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '32px', fontWeight: 900, color: '#00ff88', letterSpacing: '3px' }}>digitalcomplaint</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--text3)', letterSpacing: '3px', marginTop: '6px' }}>// CREATE NEW ACCOUNT</div>
        </div>
        <div className="card">
          <h2 style={{ marginBottom: '24px', fontSize: '15px', letterSpacing: '2px' }}>REGISTER</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="field">
                <label>FULL NAME</label>
                <input placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="field">
                <label>PHONE (optional)</label>
                <input placeholder="+91 9999999999" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>EMAIL ADDRESS</label>
              <input type="email" placeholder="user@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label>PASSWORD</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div className="field">
              <label>PRIMARY DOMAIN</label>
              <select value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}>
                <option value="public">🌍 Public Domain (Civic Issues)</option>
                <option value="college">🏫 College Domain</option>
                <option value="company">🏢 Company Domain</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--g)', textDecoration: 'none' }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
