import React, { useState, useEffect } from 'react';
import { MessageSquare, LayoutDashboard, FileText, Users, Shield } from 'lucide-react';
import YouthBot from './components/YouthBot';
import CoordinatorTracker from './components/CoordinatorTracker';
import ElderPresentation from './components/ElderPresentation';

export default function App() {
  const [activeTab, setActiveTab] = useState('bot'); // 'bot', 'tracker', 'summary'
  const [teamMembers, setTeamMembers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);

  useEffect(() => {
    fetchTeam();
    fetchCycles();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data);
      }
    } catch (err) {
      console.error('Failed to fetch team:', err);
    }
  };

  const fetchCycles = async () => {
    try {
      const res = await fetch('/api/cycles');
      if (res.ok) {
        const data = await res.json();
        setCycles(data);
        if (data.length > 0) {
          const active = data.find(c => c.is_active) || data[0];
          setSelectedCycle(active);
        }
      }
    } catch (err) {
      console.error('Failed to fetch cycles:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Header */}
      <header style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--glass-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              padding: '0.6rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: 1.2 }}>BCoC Youth Ministry</h1>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Deacon Coordinator Portal • Talin Pepper</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav style={{
            display: 'flex',
            gap: '0.5rem',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setActiveTab('bot')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontFamily: 'var(--font-family)',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeTab === 'bot' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'bot' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              <MessageSquare size={16} /> Deacon Survey Bot
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontFamily: 'var(--font-family)',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeTab === 'tracker' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'tracker' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              <LayoutDashboard size={16} /> Coordinator Dashboard
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontFamily: 'var(--font-family)',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeTab === 'summary' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'summary' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              <FileText size={16} /> Elders Presentation
            </button>
          </nav>
        </div>
      </header>

      {/* Main View Area */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {activeTab === 'bot' && (
          <YouthBot
            teamMembers={teamMembers}
            cycles={cycles}
            onSubmissionComplete={() => {
              // Optionally trigger refresh on dashboard
            }}
          />
        )}

        {activeTab === 'tracker' && (
          <CoordinatorTracker
            cycles={cycles}
            selectedCycle={selectedCycle}
            onCycleChange={cycle => setSelectedCycle(cycle)}
          />
        )}

        {activeTab === 'summary' && (
          <ElderPresentation
            selectedCycle={selectedCycle}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-dim)',
        fontSize: '0.85rem'
      }}>
        BCoC Youth Ministry Deacon Coordinator Tool • Developed for Talin Pepper & Brian Sosebee • Reporting for Elders Carter Mahanay & Scott Barkley
      </footer>

    </div>
  );
}
