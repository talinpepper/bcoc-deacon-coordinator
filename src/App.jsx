import React, { useState, useEffect } from 'react';
import { MessageSquare, LayoutDashboard, FileText, Users, Shield, Lock, Key, LogOut, Clock } from 'lucide-react';
import YouthBot from './components/YouthBot';
import CoordinatorTracker from './components/CoordinatorTracker';
import ElderPresentation from './components/ElderPresentation';

const PASSCODE = 'bcoc2012';

export default function App() {
  const [activeTab, setActiveTab] = useState('bot'); // 'bot', 'tracker', 'summary'
  const [teamMembers, setTeamMembers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);

  useEffect(() => {
    fetchTeam();
    fetchCycles();
    const savedAuth = sessionStorage.getItem('bcoc_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
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

  const handleTabClick = (tab) => {
    if (tab === 'bot') {
      setActiveTab('bot');
      return;
    }

    if (isAuthenticated) {
      setActiveTab(tab);
    } else {
      setPendingTab(tab);
      setPasscodeInput('');
      setAuthError(false);
    }
  };

  const handleVerifyPasscode = (e) => {
    e.preventDefault();
    if (passcodeInput.trim().toLowerCase() === PASSCODE.toLowerCase()) {
      setIsAuthenticated(true);
      sessionStorage.setItem('bcoc_auth', 'true');
      setAuthError(false);
      if (pendingTab) {
        setActiveTab(pendingTab);
        setPendingTab(null);
      }
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('bcoc_auth');
    setActiveTab('bot');
    setPendingTab(null);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <nav style={{
              display: 'flex',
              gap: '0.5rem',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <button
                onClick={() => handleTabClick('bot')}
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
                  background: activeTab === 'bot' && !pendingTab ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'bot' && !pendingTab ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <MessageSquare size={16} /> Deacon Survey Bot
              </button>

              <button
                onClick={() => handleTabClick('tracker')}
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
                  background: (activeTab === 'tracker' || pendingTab === 'tracker') ? 'var(--accent-primary)' : 'transparent',
                  color: (activeTab === 'tracker' || pendingTab === 'tracker') ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <LayoutDashboard size={16} /> Coordinator Dashboard {!isAuthenticated && <Lock size={13} style={{ marginLeft: '2px' }} />}
              </button>

              <button
                onClick={() => handleTabClick('summary')}
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
                  background: (activeTab === 'summary' || pendingTab === 'summary') ? 'var(--accent-primary)' : 'transparent',
                  color: (activeTab === 'summary' || pendingTab === 'summary') ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <FileText size={16} /> Elders Presentation {!isAuthenticated && <Lock size={13} style={{ marginLeft: '2px' }} />}
              </button>
            </nav>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                title="Lock Dashboard & Presentation"
              >
                <LogOut size={15} /> Lock
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* Password Modal Prompt if trying to view protected section */}
        {pendingTab && !isAuthenticated ? (
          <div className="animate-fade-in" style={{ maxWidth: '480px', margin: '3rem auto' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', border: '1px solid var(--accent-primary)' }}>
              <div style={{
                display: 'inline-flex',
                padding: '1rem',
                background: 'rgba(56, 189, 248, 0.15)',
                borderRadius: '50%',
                color: 'var(--accent-primary)',
                marginBottom: '1rem'
              }}>
                <Lock size={36} />
              </div>

              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Leadership Access Required</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
                The <strong>{pendingTab === 'tracker' ? 'Coordinator Dashboard' : 'Elders Presentation'}</strong> is password protected to protect phone numbers and member privacy.
              </p>

              <form onSubmit={handleVerifyPasscode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="Enter passcode..."
                    value={passcodeInput}
                    onChange={e => {
                      setPasscodeInput(e.target.value);
                      setAuthError(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem 0.85rem 2.75rem',
                      background: 'var(--bg-dark)',
                      border: authError ? '1px solid var(--accent-danger)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                    autoFocus
                  />
                  <Key size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>

                {authError && (
                  <p style={{ color: 'var(--accent-danger)', fontSize: '0.875rem', fontWeight: '500' }}>
                    Incorrect passcode. Please try again.
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPendingTab(null)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.75rem' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.75rem' }}
                  >
                    Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'bot' && (
              <div className="animate-fade-in glass-panel" style={{ maxWidth: '600px', margin: '3rem auto', padding: '3rem 2rem', textAlign: 'center', border: '1px solid var(--accent-warning)' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(251, 191, 36, 0.15)', borderRadius: '50%', color: 'var(--accent-warning)', marginBottom: '1.25rem' }}>
                  <Clock size={40} />
                </div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Survey Submissions Paused</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                  The Youth Ministry survey bot is briefly paused for system maintenance. Submissions will re-open shortly!
                </p>
              </div>
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
          </>
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
        BCoC Deacon Coordinator Tool
      </footer>

    </div>
  );
}
