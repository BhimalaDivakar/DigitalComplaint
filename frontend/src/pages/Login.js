import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '36px', fontWeight: 900, color: '#00ff88', letterSpacing: '3px', marginBottom: '8px' }}>
            digitalcomplaint
          </div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--text3)', letterSpacing: '3px' }}>
            // DIGITAL COMPLAINT RESOLUTION
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '24px', fontSize: '16px', letterSpacing: '2px' }}>ACCESS TERMINAL</h2>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>EMAIL ADDRESS</label>
              <input type="email" placeholder="user@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label>PASSWORD</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'AUTHENTICATING...' : 'LOGIN →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text3)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--g)', textDecoration: 'none' }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
