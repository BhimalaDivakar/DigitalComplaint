import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getComplaints } from '../services/api';

const DOMAINS = [
  { key: 'public', icon: '🌍', name: 'Public Domain', desc: 'Roads, water, electricity, garbage, street lights & civic issues', color: '#00ff88' },
  { key: 'college', icon: '🏫', name: 'College Domain', desc: 'Academic, hostel, infrastructure, WiFi & exam related issues', color: '#00ccff' },
  { key: 'company', icon: '🏢', name: 'Company Domain', desc: 'HR, technical, workplace, payroll & internal issues', color: '#ff9900' },
];

const StatCard = ({ num, label, color }) => (
  <div className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '30px', fontWeight: 700, color: color || 'var(--g)' }}>{num}</div>
    <div style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '1px', marginTop: '4px' }}>{label}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, submitted: 0, inProgress: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    getComplaints({ limit: 5 }).then(res => {
      const list = res.data.complaints || [];
      setRecentComplaints(list);
      setStats({
        total: res.data.total || list.length,
        submitted: list.filter(c => c.status === 'Submitted').length,
        inProgress: list.filter(c => c.status === 'In Progress').length,
        resolved: list.filter(c => c.status === 'Resolved').length,
      });
    }).catch(() => {});
  }, []);

  const statusClass = (s) => {
    const map = { Submitted: 'badge-submitted', 'Under Review': 'badge-review', 'In Progress': 'badge-progress', Resolved: 'badge-resolved', Escalated: 'badge-escalated', Rejected: 'badge-rejected' };
    return map[s] || 'badge-submitted';
  };

  return (
    <div className="container page">
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '32px 0 40px' }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--text3)', letterSpacing: '3px', marginBottom: '10px' }}>// AI-POWERED COMPLAINT RESOLUTION SYSTEM</div>
        <h1 style={{ fontSize: '48px', letterSpacing: '4px', marginBottom: '12px' }}>digitalcomplaint</h1>
        <p style={{ color: 'var(--text2)', fontSize: '15px', letterSpacing: '2px', fontFamily: 'Share Tech Mono, monospace' }}>
          Transparent · Accountable · AI-Powered
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '36px' }}>
        <StatCard num={stats.total} label="TOTAL ISSUES" />
        <StatCard num={stats.inProgress} label="IN PROGRESS" color="#ff9900" />
        <StatCard num={stats.resolved} label="RESOLVED" />
        <StatCard num={stats.submitted} label="PENDING" color="#8888ff" />
      </div>

      {/* Domain Selection */}
      <div className="section-title">Select Domain to Report</div>
      <div className="grid-3" style={{ marginBottom: '40px' }}>
        {DOMAINS.map(d => (
          <div key={d.key} onClick={() => navigate(`/submit?domain=${d.key}`)}
            style={{
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '4px',
              padding: '28px 20px', cursor: 'pointer', transition: 'all 0.25s', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = d.color; e.currentTarget.style.background = 'var(--bg3)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,255,136,0.2)'; e.currentTarget.style.background = 'var(--bg2)'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: d.color, opacity: 0.6 }}></div>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{d.icon}</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '13px', fontWeight: 700, color: d.color, letterSpacing: '1px', marginBottom: '8px' }}>{d.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: 1.5 }}>{d.desc}</div>
            <div style={{ marginTop: '16px', fontSize: '12px', color: d.color, fontFamily: 'Share Tech Mono, monospace', letterSpacing: '1px' }}>
              REPORT ISSUE →
            </div>
          </div>
        ))}
      </div>

      {/* Recent complaints */}
      <div className="section-title">Recent Complaints</div>
      {recentComplaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px' }}>
          // No complaints yet. Be the first to report an issue.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recentComplaints.map(c => (
            <div key={c._id} className="card" onClick={() => navigate(`/complaints/${c._id}`)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--g)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,0.2)'}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--text3)' }}>{c.complaintId} · {c.category}</div>
                <div style={{ fontSize: '15px', color: 'var(--text)', marginTop: '3px' }}>{c.title}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                <span className={`badge badge-${(c.priority || 'low').toLowerCase()}`}>{c.priority}</span>
                <span className={`badge ${statusClass(c.status)}`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button className="btn-outline" onClick={() => navigate('/complaints')}>VIEW ALL COMPLAINTS →</button>
      </div>
    </div>
  );
};

export default Dashboard;
