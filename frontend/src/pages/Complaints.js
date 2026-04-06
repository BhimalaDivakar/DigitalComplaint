import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComplaints, voteComplaint } from '../services/api';
import { toast } from 'react-toastify';

const statusClass = (s) => ({ Submitted: 'badge-submitted', 'Under Review': 'badge-review', 'In Progress': 'badge-progress', Resolved: 'badge-resolved', Escalated: 'badge-escalated', Rejected: 'badge-rejected' }[s] || 'badge-submitted');
const prioClass = (p) => ({ High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low', Critical: 'badge-critical' }[p] || 'badge-low');

const STEPS = ['Submitted', 'In Progress', 'Resolved'];

const ComplaintCard = ({ c, onVote }) => {
  const navigate = useNavigate();
  const si = STEPS.indexOf(c.status);
  return (
    <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--g)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,0.2)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1 }} onClick={() => navigate(`/complaints/${c._id}`)}>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--text3)', marginBottom: '4px' }}>
            {c.complaintId} · {c.location?.address} · {new Date(c.createdAt).toLocaleDateString()}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>{c.title}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={`badge ${prioClass(c.priority)}`}>{c.priority}</span>
            <span className={`badge ${statusClass(c.status)}`}>{c.status}</span>
            <span className="badge" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid var(--border)', color: 'var(--text2)' }}>{c.category}</span>
            <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'Share Tech Mono, monospace' }}>{c.domain}</span>
            {c.status === 'Resolved' && c.proofImages?.length > 0 && (
              <span className="badge badge-resolved">✓ Proof Uploaded</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button onClick={(e) => { e.stopPropagation(); onVote(c._id); }}
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', padding: '4px 12px', borderRadius: '2px', fontSize: '12px', fontFamily: 'Share Tech Mono, monospace', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--g)'; e.target.style.color = 'var(--g)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(0,255,136,0.2)'; e.target.style.color = 'var(--text2)'; }}
          >▲ {c.voteCount || 0}</button>
          <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'Share Tech Mono, monospace' }}>votes</div>
        </div>
      </div>
      <div className="progress-track">
        {STEPS.map((_, i) => <div key={i} className={`progress-step${i <= si ? ' done' : ''}`}></div>)}
      </div>
    </div>
  );
};

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ domain: '', status: '', priority: '', search: '' });
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getComplaints({ domain: filters.domain, status: filters.status, priority: filters.priority });
      let list = res.data.complaints || [];
      if (filters.search) list = list.filter(c => c.title.toLowerCase().includes(filters.search.toLowerCase()) || c.category.toLowerCase().includes(filters.search.toLowerCase()));
      setComplaints(list);
      setTotal(res.data.total || list.length);
    } catch { setComplaints([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters.domain, filters.status, filters.priority]);

  const handleVote = async (id) => {
    try {
      const res = await voteComplaint(id);
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, voteCount: res.data.voteCount } : c));
      toast.success(res.data.voted ? '▲ Upvoted!' : 'Vote removed');
    } catch { toast.error('Failed to vote'); }
  };

  const f = (k, v) => setFilters(prev => ({ ...prev, [k]: v }));

  const filtered = filters.search
    ? complaints.filter(c => c.title.toLowerCase().includes(filters.search.toLowerCase()) || (c.category || '').toLowerCase().includes(filters.search.toLowerCase()))
    : complaints;

  return (
    <div className="container page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Complaint Tracker ({total})</div>
        <button className="btn-primary" onClick={() => navigate('/submit')} style={{ padding: '8px 20px', fontSize: '12px' }}>+ Report Issue</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input placeholder="Search complaints..." value={filters.search} onChange={e => f('search', e.target.value)} style={{ flex: 1, minWidth: '200px' }} />
        <select value={filters.domain} onChange={e => f('domain', e.target.value)} style={{ width: '160px' }}>
          <option value="">All Domains</option>
          <option value="public">Public</option>
          <option value="college">College</option>
          <option value="company">Company</option>
        </select>
        <select value={filters.status} onChange={e => f('status', e.target.value)} style={{ width: '160px' }}>
          <option value="">All Status</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Escalated">Escalated</option>
        </select>
        <select value={filters.priority} onChange={e => f('priority', e.target.value)} style={{ width: '140px' }}>
          <option value="">All Priority</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)', fontFamily: 'Share Tech Mono, monospace', fontSize: '13px' }}>
          // No complaints found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(c => <ComplaintCard key={c._id} c={c} onVote={handleVote} />)}
        </div>
      )}
    </div>
  );
};

export default Complaints;
