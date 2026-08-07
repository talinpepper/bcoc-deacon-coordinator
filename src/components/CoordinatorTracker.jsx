import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, CheckCircle2, Clock, AlertTriangle, Copy, ExternalLink } from 'lucide-react';

export default function CoordinatorTracker({ cycles, selectedCycle, onCycleChange, onRefresh }) {
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (selectedCycle) {
      fetchCycleStatus(selectedCycle.id);
    }
  }, [selectedCycle]);

  const fetchCycleStatus = async (cycleId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cycles/${cycleId}/status`);
      if (res.ok) {
        const data = await res.json();
        setStatusList(data);
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSmsLink = (member) => {
    const appUrl = window.location.origin;
    const message = `Hey ${member.name.split(' ')[0]}! Hope you're doing well. As we prepare for our Youth Ministry report for the elders for the 26th, could you take 2 minutes to share a quick update on your area here? ${appUrl}\n\nThanks for all you do! - Talin`;
    
    // Encodes SMS uri for native mobile messages app
    const encodedMsg = encodeURIComponent(message);
    const cleanPhone = member.phone.replace(/[^0-9]/g, '');
    return `sms:${cleanPhone}?body=${encodedMsg}`;
  };

  const handleCopySms = (member, id) => {
    const appUrl = window.location.origin;
    const message = `Hey ${member.name.split(' ')[0]}! Hope you're doing well. As we prepare for our Youth Ministry report for the elders for the 26th, could you take 2 minutes to share a quick update on your area here? ${appUrl}\n\nThanks for all you do! - Talin`;
    
    navigator.clipboard.writeText(message);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const totalSubmitted = statusList.filter(s => s.submitted).length;
  const totalExpected = statusList.length;
  const progressPercent = totalExpected > 0 ? Math.round((totalSubmitted / totalExpected) * 100) : 0;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header & Cycle Switcher */}
      <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Youth Ministry Team Progress Tracker</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Track submissions and send 1-click SMS reminders to Mason, Dylan, and your Youth Deacons.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Reporting Cycle:</label>
          <select
            value={selectedCycle ? selectedCycle.id : ''}
            onChange={e => {
              const cycle = cycles.find(c => c.id === parseInt(e.target.value));
              if (cycle && onCycleChange) onCycleChange(cycle);
            }}
            style={{
              background: 'var(--bg-dark)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 1rem',
              fontFamily: 'var(--font-family)',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          >
            {cycles.map(c => (
              <option key={c.id} value={c.id}>{c.title} ({c.due_date})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Completion Progress for {selectedCycle ? selectedCycle.title : ''}</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '1.2rem' }}>
            {totalSubmitted} of {totalExpected} Submitted ({progressPercent}%)
          </span>
        </div>

        <div style={{ height: '12px', background: 'var(--bg-dark)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #0284c7 0%, #34d399 100%)',
            transition: 'width 0.5s ease-in-out'
          }} />
        </div>
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading progress data...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {statusList.map(({ member, submitted, submission }) => (
            <div
              key={member.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                gap: '1.25rem',
                borderLeft: submitted ? '4px solid var(--accent-success)' : '4px solid var(--accent-warning)',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{member.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '500' }}>
                      {member.sub_role}
                    </span>
                  </div>

                  {submitted ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.75rem',
                      background: 'rgba(52, 211, 153, 0.15)',
                      color: 'var(--accent-success)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      <CheckCircle2 size={14} /> Submitted
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.75rem',
                      background: 'rgba(251, 191, 36, 0.15)',
                      color: 'var(--accent-warning)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      <Clock size={14} /> Pending
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <Phone size={14} /> {member.phone}
                </div>

                {submitted && submission?.requires_elder_escalation === 1 && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(248, 113, 113, 0.15)',
                    color: 'var(--accent-danger)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.825rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600'
                  }}>
                    <AlertTriangle size={15} /> Requires Elder Guidance/Approval
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', pt: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <a
                  href={generateSmsLink(member)}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                >
                  <MessageSquare size={16} /> 1-Click SMS
                </a>

                <button
                  onClick={() => handleCopySms(member, member.id)}
                  className="btn btn-secondary"
                  title="Copy reminder text to clipboard"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                >
                  {copiedId === member.id ? <CheckCircle2 size={16} color="var(--accent-success)" /> : <Copy size={16} />}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
