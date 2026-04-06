import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getAdminComplaints, updateStatus, escalateComplaint } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const StatCard = ({ num, label, color }) => (
  <div className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '28px', fontWeight: 700, color: color || 'var(--g)' }}>{num}</div>
    <div style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '1px', marginTop: '4px' }}>{label}</div>
  </div>
);

const statusClass = (s) => ({ Submitted: 'badge-submitted', 'Under Review': 'badge-review', 'In Progress': 'badge-progress', Resolved: 'badge-resolved', Escalated: 'badge-escalated', Rejected: 'badge-rejected' }[s] || 'badge-submitted');
const prioClass = (p) => ({ High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low', Critical: 'badge-critical' }[p] || 'badge-low');

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ domain: '', status: '', priority: '' });

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    loadAll();
  }, []);

  useEffect(() => { loadComplaints(); }, [filters]);

  const loadAll = async () => {
    try {
      const [sRes, cRes] = await Promise.all([getAdminStats(), getAdminComplaints()]);
      setStats(sRes.data);
      setComplaints(cRes.data.complaints || []);
    } catch { toast.error('Failed to load admin data'); } finally { setLoading(false); }
  };

  const loadComplaints = async () => {
    try {
      const res = await getAdminComplaints(filters);
      setComplaints(res.data.complaints || []);
    } catch {}
  };

  const handleStatus = async (id, status) => {
    try {
      await updateStatus(id, { status, note: `Marked as ${status} by admin` });
      toast.success(`Updated to ${status}`);
      loadComplaints();
    } catch { toast.error('Update failed'); }
  };

  const handleEscalate = async (id) => {
    try {
      await escalateComplaint(id);
      toast.success('Complaint escalated');
      loadComplaints();
    } catch { toast.error('Escalation failed'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner"></div></div>;

  return (
    <div className="container page">
      <div className="section-title">Admin Dashboard</div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <StatCard num={stats.total || 0} label="TOTAL" />
        <StatCard num={stats.inProgress || 0} label="IN PROGRESS" color="#ff9900" />
        <StatCard num={stats.resolved || 0} label="RESOLVED" />
        <StatCard num={stats.overdueSLA || 0} label="OVERDUE SLA" color="var(--red)" />
      </div>

      {/* Category breakdown */}
      {stats.byCategory?.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="section-title" style={{ fontSize: '12px', marginBottom: '14px' }}>Category Breakdown</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {stats.byCategory.slice(0, 8).map(c => (
              <div key={c._id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '3px', padding: '6px 14px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '18px', color: 'var(--g)' }}>{c.count}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'Share Tech Mono, monospace' }}>{c._id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select value={filters.domain} onChange={e => setFilters(f => ({ ...f, domain: e.target.value }))} style={{ width: '150px' }}>
          <option value="">All Domains</option>
          <option value="public">Public</option>
          <option value="college">College</option>
          <option value="company">Company</option>
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={{ width: '160px' }}>
          <option value="">All Status</option>
          <option value="Submitted">Submitted</option>
          <option value="In Progress">In Progress</option>
          <option value="Escalated">Escalated</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))} style={{ width: '140px' }}>
          <option value="">All Priority</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: '0', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border2)' }}>
              {['ID', 'Issue', 'Domain', 'Category', 'Priority', 'Status', 'SLA', 'Votes', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--text3)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => {
              const isOverdue = c.sla?.deadline && new Date(c.sla.deadline) < new Date() && c.status !== 'Resolved';
              return (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,136,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 14px', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{c.complaintId}</td>
                  <td style={{ padding: '12px 14px', maxWidth: '220px' }}>
                    <div style={{ color: 'var(--text)', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      onClick={() => navigate(`/complaints/${c._id}`)}>{c.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'Share Tech Mono, monospace' }}>{c.location?.address}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}><span className="badge" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid var(--border)', color: 'var(--text2)' }}>{c.domain}</span></td>
                  <td style={{ padding: '12px 14px', color: 'var(--text3)', fontSize: '12px', whiteSpace: 'nowrap' }}>{c.category}</td>
                  <td style={{ padding: '12px 14px' }}><span className={`badge ${prioClass(c.priority)}`}>{c.priority}</span></td>
                  <td style={{ padding: '12px 14px' }}><span className={`badge ${statusClass(c.status)}`}>{c.status}</span></td>
                  <td style={{ padding: '12px 14px', fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: isOverdue ? 'var(--red)' : 'var(--text3)', whiteSpace: 'nowrap' }}>
                    {isOverdue ? '⚠ OVERDUE' : c.sla?.deadline ? new Date(c.sla.deadline).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'Orbitron, monospace', fontSize: '14px', color: 'var(--g)' }}>{c.voteCount || 0}</td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <button onClick={() => handleStatus(c._id, 'In Progress')} style={{ background: 'transparent', border: '1px solid rgba(0,255,136,0.3)', color: 'var(--text2)', padding: '3px 8px', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', cursor: 'pointer', borderRadius: '2px', marginRight: '4px' }}
                      onMouseEnter={e => { e.target.style.borderColor = 'var(--g)'; e.target.style.color = 'var(--g)'; }}
                      onMouseLeave={e => { e.target.style.borderColor = 'rgba(0,255,136,0.3)'; e.target.style.color = 'var(--text2)'; }}>Progress</button>
                    <button onClick={() => handleStatus(c._id, 'Resolved')} style={{ background: 'transparent', border: '1px solid rgba(0,255,136,0.3)', color: 'var(--text2)', padding: '3px 8px', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', cursor: 'pointer', borderRadius: '2px', marginRight: '4px' }}
                      onMouseEnter={e => { e.target.style.borderColor = 'var(--g)'; e.target.style.color = 'var(--g)'; }}
                      onMouseLeave={e => { e.target.style.borderColor = 'rgba(0,255,136,0.3)'; e.target.style.color = 'var(--text2)'; }}>Resolve</button>
                    <button onClick={() => handleEscalate(c._id)} style={{ background: 'transparent', border: '1px solid rgba(255,60,60,0.3)', color: '#ff8888', padding: '3px 8px', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', cursor: 'pointer', borderRadius: '2px' }}
                      onMouseEnter={e => { e.target.style.borderColor = 'var(--red)'; e.target.style.color = 'var(--red)'; }}
                      onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,60,60,0.3)'; e.target.style.color = '#ff8888'; }}>Escalate</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {complaints.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px' }}>// No complaints found</div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
