import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { submitComplaint, analyzeComplaint } from '../services/api';
import { toast } from 'react-toastify';

const CATEGORIES = {
  public: ['Roads / Potholes', 'Water Supply', 'Electricity / Outage', 'Garbage Collection', 'Street Lights', 'Drainage', 'Transportation', 'Sanitation', 'Sexual Harassment', 'Family Issues', 'Cyber Crime', 'Public Safety', 'Corruption', 'Labor Rights', 'Healthcare', 'Environmental Issues'],
  college: ['WiFi Issues', 'Hostel Issues', 'Academic Issues', 'Infrastructure', 'Exam Related', 'Library', 'Cafeteria', 'Sports Facilities'],
  company: ['HR Issues', 'Technical Issues', 'Workplace Complaints', 'Payroll Issues', 'Safety Concerns', 'IT Support'],
};

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const aiTimer = useRef(null);

  const [form, setForm] = useState({
    domain: searchParams.get('domain') || 'public',
    category: '',
    title: '',
    description: '',
    address: '',
    lat: '',
    lng: '',
    priority: 'Medium',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Trigger AI analysis on title/description change
  useEffect(() => {
    if (form.title.length < 5 && form.description.length < 5) return;
    clearTimeout(aiTimer.current);
    setAiLoading(true);
    aiTimer.current = setTimeout(async () => {
      try {
        const res = await analyzeComplaint({ title: form.title, description: form.description, domain: form.domain });
        setAiResult(res.data);
        if (res.data.detectedCategory && !form.category) set('category', res.data.detectedCategory);
        if (res.data.detectedPriority) set('priority', res.data.detectedPriority);
      } catch {
        // fallback silently
      } finally {
        setAiLoading(false);
      }
    }, 900);
    return () => clearTimeout(aiTimer.current);
  }, [form.title, form.description, form.domain]);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.title || !form.address) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (aiResult) fd.append('aiAnalysis', JSON.stringify(aiResult));
      images.forEach(img => fd.append('images', img));
      const res = await submitComplaint(fd);
      toast.success(res.data.message || 'Complaint submitted!');
      navigate('/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const priorityStyle = { High: { color: '#ff3c3c', border: 'rgba(255,60,60,0.4)' }, Critical: { color: '#ff0000', border: 'red' }, Medium: { color: 'orange', border: 'rgba(255,165,0,0.4)' }, Low: { color: 'var(--g)', border: 'var(--border2)' } };
  const ps = priorityStyle[form.priority] || priorityStyle.Medium;

  return (
    <div className="container page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
        <button className="btn-outline" onClick={() => navigate('/')} style={{ padding: '6px 14px', fontSize: '12px' }}>← Back</button>
        <h2 style={{ fontSize: '16px', letterSpacing: '2px' }}>
          {{ public: '🌍 Public', college: '🏫 College', company: '🏢 Company' }[form.domain]} — New Complaint
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ marginBottom: '0' }}>
          {/* Domain */}
          <div className="field">
            <label>DOMAIN</label>
            <select value={form.domain} onChange={e => { set('domain', e.target.value); set('category', ''); }}>
              <option value="public">🌍 Public Domain</option>
              <option value="college">🏫 College Domain</option>
              <option value="company">🏢 Company Domain</option>
            </select>
          </div>

          {/* Category */}
          <div className="field">
            <label>CATEGORY *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} required>
              <option value="">-- Select Category --</option>
              {(CATEGORIES[form.domain] || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Title */}
          <div className="field full">
            <label>PROBLEM TITLE *</label>
            <input placeholder="Brief, clear description of the issue..." value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>

          {/* Description */}
          <div className="field full">
            <label>DETAILED DESCRIPTION</label>
            <textarea placeholder="Describe in detail: what is the issue, how long has it been occurring, impact on daily life, any previous complaints..." value={form.description} onChange={e => set('description', e.target.value)} style={{ minHeight: '120px' }} />
          </div>

          {/* AI Analysis Box */}
          <div className="field full">
            <label>AI ANALYSIS ENGINE</label>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '4px', padding: '14px 16px' }}>
              {aiLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text2)', fontSize: '13px', fontFamily: 'Share Tech Mono, monospace' }}>
                  <div className="spinner" style={{ width: 16, height: 16 }}></div>
                  AI analyzing your complaint...
                </div>
              ) : aiResult ? (
                <div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--text2)', marginBottom: '10px' }}>
                    🤖 {aiResult.suggestion}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ padding: '3px 12px', border: `1px solid ${ps.border}`, color: ps.color, borderRadius: '2px', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace' }}>
                      {form.priority} Priority
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'Share Tech Mono, monospace' }}>
                      Confidence: {Math.round((aiResult.confidence || 0.5) * 100)}%
                    </span>
                    {aiResult.isDuplicate && (
                      <span style={{ padding: '3px 12px', border: '1px solid rgba(255,165,0,0.5)', color: 'orange', borderRadius: '2px', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace' }}>
                        ⚠ Possible Duplicate: {aiResult.duplicateOf}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', color: 'var(--text3)' }}>
                  🤖 Start typing — AI will auto-categorize & detect priority
                </div>
              )}
            </div>
          </div>

          {/* Priority override */}
          <div className="field">
            <label>PRIORITY (AI-DETECTED / OVERRIDE)</label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Location */}
          <div className="field">
            <label>LOCATION / ADDRESS *</label>
            <input placeholder="e.g. Main Road near Gate 2, Block-A..." value={form.address} onChange={e => set('address', e.target.value)} required />
          </div>

          {/* Image Upload */}
          <div className="field full">
            <label>ATTACH PHOTO EVIDENCE (up to 5)</label>
            <div style={{ border: '1px dashed var(--border2)', borderRadius: '4px', padding: '28px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg2)', position: 'relative' }}
              onClick={() => document.getElementById('img-upload').click()}>
              <input id="img-upload" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImages} />
              {previews.length > 0 ? (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {previews.map((p, i) => (
                    <img key={i} src={p} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '3px', border: '1px solid var(--border2)' }} />
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>📸</div>
                  <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Click to upload images (max 5MB each)</div>
                </>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="field full">
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }} disabled={loading}>
              {loading ? 'SUBMITTING...' : '⚡ SUBMIT COMPLAINT'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SubmitComplaint;
