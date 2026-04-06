import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { path: '/', label: 'Dashboard' },
    { path: '/complaints', label: 'Complaints' },
    { path: '/submit', label: 'Report Issue' },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin Panel' }] : [])
  ];

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px', borderBottom: '1px solid rgba(0,255,136,0.2)',
      background: 'rgba(3,10,6,0.95)', backdropFilter: 'blur(8px)',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '20px', fontWeight: 900, color: '#00ff88', letterSpacing: '2px' }}>
          Digital<span style={{ color: '#fff' }}>Complaint</span>
        </div>
      </Link>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {links.map(l => (
          <Link key={l.path} to={l.path} style={{ textDecoration: 'none' }}>
            <button style={{
              background: location.pathname === l.path ? 'rgba(0,255,136,0.1)' : 'transparent',
              border: `1px solid ${location.pathname === l.path ? '#00ff88' : 'rgba(0,255,136,0.2)'}`,
              color: location.pathname === l.path ? '#00ff88' : '#66cc88',
              padding: '6px 14px', borderRadius: '3px',
              fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', letterSpacing: '1px', cursor: 'pointer'
            }}>
              {l.label}
            </button>
          </Link>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px', borderLeft: '1px solid rgba(0,255,136,0.2)', paddingLeft: '14px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'Share Tech Mono, monospace' }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#00ff88', marginRight: 6, animation: 'pulse 2s infinite' }}></span>
            {user?.name}
          </span>
          <button onClick={handleLogout} className="btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
