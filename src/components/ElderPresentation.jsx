import React, { useState, useEffect } from 'react';
import { FileText, Printer, Sparkles, AlertTriangle, Calendar, Flame, Heart, CheckCircle2 } from 'lucide-react';

export default function ElderPresentation({ selectedCycle }) {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCycle) {
      fetchSummary(selectedCycle.id);
    }
  }, [selectedCycle]);

  const fetchSummary = async (cycleId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cycles/${cycleId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Compiling & AI-Polishing Elder Presentation Report...</div>;
  }

  if (!summaryData) return null;

  const { cycle, totalExpected, totalReceived, submissions, aiPolishedSummary } = summaryData;

  const escalationItems = submissions.filter(s => s.requires_elder_escalation === 1 || (s.elder_approval_items && s.elder_approval_items.toLowerCase() !== 'none' && s.elder_approval_items.trim() !== ''));

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Header Card */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-primary)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem' }}>
            <Sparkles size={16} /> AI-Polished Executive Summary
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>Elders Presentation Report</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Prepared for the Elders • Youth Ministry Area
          </p>
        </div>

        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={18} /> Export / Print Presentation
        </button>
      </div>

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target Elders Meeting</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
            {cycle ? cycle.title : 'December Presentation Report'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reporting Coverage</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--accent-success)', marginTop: '0.25rem' }}>
            {totalReceived} of {totalExpected} Members
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Items for Elder Guidance</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: escalationItems.length > 0 ? 'var(--accent-warning)' : 'var(--text-main)', marginTop: '0.25rem' }}>
            {escalationItems.length} Flagged
          </div>
        </div>
      </div>

      {/* AI Executive Summary Block if Available */}
      {aiPolishedSummary && (
        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--accent-primary)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-primary)', marginBottom: '1.25rem' }}>
            <Sparkles size={24} />
            <h3 style={{ fontSize: '1.4rem', color: '#ffffff' }}>AI Executive Summary & Grammar Cleanup</h3>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)', lineHeight: '1.7', fontSize: '1rem' }}>
            {aiPolishedSummary}
          </div>
        </div>
      )}

      {/* Elder Approvals & Escalation Box */}
      {escalationItems.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--accent-warning)', background: 'rgba(251, 191, 36, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-warning)', marginBottom: '1rem' }}>
            <AlertTriangle size={24} />
            <h3 style={{ fontSize: '1.3rem', color: 'var(--accent-warning)' }}>Items Requiring Elder Decision or Guidance</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {escalationItems.map(item => (
              <div key={item.id} style={{ background: 'var(--bg-dark)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-warning)' }}>
                <div style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                  {item.member_name} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({item.sub_role})</span>
                </div>
                <p style={{ color: 'var(--text-main)', fontSize: '0.98rem' }}>{item.elder_approval_items}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categorized Submissions */}
      {submissions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No deacon updates submitted yet for this reporting cycle.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Wins & Encouragements */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-success)', marginBottom: '1.25rem' }}>
              <Sparkles size={22} />
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff' }}>Wins & Encouraging News</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {submissions.filter(s => s.wins_encouragements && s.wins_encouragements.toLowerCase() !== 'none').map(s => (
                <div key={s.id} style={{ borderBottom: '1px solid var(--border-color)', pb: '1rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{s.member_name} ({s.sub_role})</div>
                  <p style={{ fontSize: '0.98rem', color: 'var(--text-main)', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{s.wins_encouragements}</p>
                </div>
              ))}
            </div>
          </div>

          {/* General Updates */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-primary)', marginBottom: '1.25rem' }}>
              <Calendar size={22} />
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff' }}>General Updates & Upcoming Events</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {submissions.filter(s => s.general_updates && s.general_updates.toLowerCase() !== 'none').map(s => (
                <div key={s.id} style={{ borderBottom: '1px solid var(--border-color)', pb: '1rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{s.member_name} ({s.sub_role})</div>
                  <p style={{ fontSize: '0.98rem', color: 'var(--text-main)', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{s.general_updates}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges & Needs */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-warning)', marginBottom: '1.25rem' }}>
              <Flame size={22} />
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff' }}>Challenges, Hurdles & Needs</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {submissions.filter(s => s.challenges_obstacles && s.challenges_obstacles.toLowerCase() !== 'none').map(s => (
                <div key={s.id} style={{ borderBottom: '1px solid var(--border-color)', pb: '1rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{s.member_name} ({s.sub_role})</div>
                  <p style={{ fontSize: '0.98rem', color: 'var(--text-main)', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{s.challenges_obstacles}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Prayer Requests */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-secondary)', marginBottom: '1.25rem' }}>
              <Heart size={22} />
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff' }}>Prayer Requests</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {submissions.filter(s => s.prayer_requests && s.prayer_requests.toLowerCase() !== 'none').map(s => (
                <div key={s.id} style={{ borderBottom: '1px solid var(--border-color)', pb: '1rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{s.member_name} ({s.sub_role})</div>
                  <p style={{ fontSize: '0.98rem', color: 'var(--text-main)', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{s.prayer_requests}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
