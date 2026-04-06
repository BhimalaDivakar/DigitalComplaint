import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaint, voteComplaint, updateStatus, uploadProof } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const statusClass = (s) => ({ Submitted: 'badge-submitted', 'Under Review': 'badge-review', 'In Progress': 'badge-progress', Resolved: 'badge-resolved', Escalated: 'badge-escalated', Rejected: 'badge-rejected' }[s] || 'badge-submitted');
const STEPS = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [proofFiles, setProofFiles] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getComplaint(id).then(res => { setComplaint(res.data.complaint); setLoading(false); }).catch(() => { toast.error('Complaint not found'); navigate('/complaints'); });
  }, [id]);

  const handleVote = async () => {
    try {
      const res = await voteComplaint(id);
      setComplaint(prev => ({ ...prev, voteCount: res.data.voteCount }));
      toast.success(res.data.voted ? '▲ Upvoted!' : 'Vote removed');
    } catch { toast.error('Failed to vote'); }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      const res = await updateStatus(id, { status: newStatus, note });
      setComplaint(res.data.complaint);
      toast.success(`Status updated to ${newStatus}`);
      setNewStatus(''); setNote('');
    } catch { toast.error('Failed to update status'); } finally { setUpdating(false); }
  };

  const handleProof = async () => {
    if (!proofFiles.length) return;
    setUpdating(true);
    try {
      const fd = new FormData();
      proofFiles.forEach(f => fd.append('proofImages', f));
      const res = await uploadProof(id, fd);
      setComplaint(res.data.complaint);
      toast.success('Proof uploaded! Complaint resolved.');
      setProofFiles([]);
    } catch { toast.error('Failed to upload proof'); } finally { setUpdating(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner"></div></div>;
  if (!complaint) return null;

  const si = STEPS.indexOf(complaint.status);
  const isAuthority = user?.role === 'admin' || user?.role === 'authority';

  return (
    <div className="container page">
      <button className="btn-outline" onClick={() => navigate('/complaints')} style={{ marginBottom: '20px', fontSize: '12px' }}>← Back to Complaints</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Main */}
        <div>
          {/* Header */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: 'var(--text3)', marginBottom: '8px' }}>
              {complaint.complaintId} · {complaint.domain?.toUpperCase()} · {new Date(complaint.createdAt).toLocaleString()}
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '14px', color: 'var(--text)', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{complaint.title}</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span className={`badge ${statusClass(complaint.status)}`}>{complaint.status}</span>
              <span className={`badge badge-${(complaint.priority || 'low').toLowerCase()}`}>{complaint.priority}</span>
              <span className="badge" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid var(--border)', color: 'var(--text2)' }}>{complaint.category}</span>
            </div>
            <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: '16px' }}>{complaint.description}</p>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--text3)' }}>
              📍 {complaint.location?.address}
            </div>

            {/* Progress */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                {STEPS.map((s, i) => (
                  <span key={s} style={{ fontSize: '10px', fontFamily: 'Share Tech Mono, monospace', color: i <= si ? 'var(--g)' : 'var(--text3)', letterSpacing: '0.5px' }}>{s}</span>
                ))}
              </div>
              <div className="progress-track">
                {STEPS.map((_, i) => <div key={i} className={`progress-step${i <= si ? ' done' : ''}`}></div>)}
              </div>
            </div>
          </div>

          {/* Images */}
          {complaint.images?.length > 0 && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="section-title">Evidence Photos</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {complaint.images.map((img, i) => (
                  <img key={i} src={img} alt="evidence" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '3px', border: '1px solid var(--border)' }} />
                ))}
              </div>
            </div>
          )}

          {/* Proof of Work */}
          {complaint.proofImages?.length > 0 && (
            <div className="card" style={{ marginBottom: '16px', borderColor: 'var(--border2)' }}>
              <div className="section-title" style={{ color: 'var(--g)' }}>✓ Proof of Resolution</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {complaint.proofImages.map((img, i) => (
                  <img key={i} src={img} alt="proof" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '3px', border: '1px solid var(--border2)' }} />
                ))}
              </div>
            </div>
          )}

          {/* Status History */}
          <div className="card">
            <div className="section-title">Activity Timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(complaint.statusHistory || []).map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--g)', marginTop: '4px', flexShrink: 0 }}></div>
                  <div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--text2)' }}>{h.status}</div>
                    {h.note && <div style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '2px' }}>{h.note}</div>}
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{new Date(h.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Vote */}
          <div className="card" style={{ marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '36px', color: 'var(--g)', fontWeight: 700 }}>{complaint.voteCount || 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '1px', marginBottom: '14px' }}>COMMUNITY VOTES</div>
            <button className="btn-primary" onClick={handleVote} style={{ width: '100%' }}>▲ UPVOTE THIS ISSUE</button>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '8px' }}>More votes = higher priority</div>
          </div>

          {/* AI Analysis */}
          {complaint.aiAnalysis?.detectedCategory && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="section-title" style={{ fontSize: '12px' }}>AI Analysis</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--text2)', lineHeight: 1.8 }}>
                <div>Category: {complaint.aiAnalysis.detectedCategory}</div>
                <div>Priority: {complaint.aiAnalysis.detectedPriority}</div>
                {complaint.aiAnalysis.confidence && <div>Confidence: {Math.round(complaint.aiAnalysis.confidence * 100)}%</div>}
                {complaint.aiAnalysis.isDuplicate && <div style={{ color: 'orange' }}>⚠ Marked as Duplicate</div>}
              </div>
            </div>
          )}

          {/* SLA */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="section-title" style={{ fontSize: '12px' }}>SLA Status</div>
            {complaint.sla?.deadline && (
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: complaint.sla.isOverdue ? 'var(--red)' : 'var(--text2)' }}>
                Deadline: {new Date(complaint.sla.deadline).toLocaleDateString()}
                {complaint.sla.isOverdue && <span style={{ color: 'var(--red)', display: 'block' }}>⚠ OVERDUE</span>}
              </div>
            )}
          </div>

          {/* Admin Controls */}
          {isAuthority && (
            <div className="card">
              <div className="section-title" style={{ fontSize: '12px' }}>Admin Controls</div>
              <div className="field">
                <label>UPDATE STATUS</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="">-- Select Status --</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>
              <div className="field">
                <label>NOTE</label>
                <input placeholder="Optional status note..." value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <button className="btn-primary" style={{ width: '100%', marginBottom: '12px' }} onClick={handleStatusUpdate} disabled={updating || !newStatus}>
                {updating ? 'UPDATING...' : 'UPDATE STATUS'}
              </button>

              <label style={{ marginTop: '8px' }}>UPLOAD PROOF OF RESOLUTION</label>
              <input type="file" accept="image/*" multiple onChange={e => setProofFiles(Array.from(e.target.files))} style={{ marginBottom: '10px' }} />
              {proofFiles.length > 0 && (
                <button className="btn-primary" style={{ width: '100%', background: 'var(--gd)' }} onClick={handleProof} disabled={updating}>
                  {updating ? 'UPLOADING...' : `📸 UPLOAD ${proofFiles.length} PROOF IMAGE(S)`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
