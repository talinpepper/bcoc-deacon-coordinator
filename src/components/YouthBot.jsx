import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, CheckCircle2, ShieldAlert, Sparkles, MessageSquare, Loader2, Save, RotateCcw, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUESTIONS = [
  {
    key: 'general_updates',
    title: '📌 General Updates & Upcoming Events',
    subtitle: 'What is currently happening in your youth ministry area? Any key dates or schedule items for the elders to know?'
  },
  {
    key: 'wins_encouragements',
    title: '🎉 Wins & Encouraging News',
    subtitle: 'Share any positive fruit, praise reports, or encouraging developments in your ministry area!'
  },
  {
    key: 'challenges_obstacles',
    title: '⚠️ Challenges, Obstacles, or Needs',
    subtitle: 'Are you facing any hurdles, resource needs, or obstacles where support is needed?'
  },
  {
    key: 'budget_updates',
    title: '💰 Budget & Financial Updates',
    subtitle: 'Any financial updates, budget requests, or upcoming resource expenses?'
  },
  {
    key: 'elder_approval_items',
    title: '✋ Items Requiring Elder Approval',
    subtitle: 'Is there anything that requires elder decision, guidance, or official approval?',
    isElderFlag: true
  },
  {
    key: 'prayer_requests',
    title: '🙏 Prayer Requests',
    subtitle: 'Specific prayer focus items for your youth ministry area, families, or personal prayer requests?'
  }
];

export default function YouthBot({ teamMembers, cycles, onSubmissionComplete }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeCycle, setActiveCycle] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);
  const [answers, setAnswers] = useState({
    general_updates: '',
    wins_encouragements: '',
    challenges_obstacles: '',
    budget_updates: '',
    elder_approval_items: '',
    prayer_requests: ''
  });
  const [currentInput, setCurrentInput] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [draftSavedMsg, setDraftSavedMsg] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (cycles && cycles.length > 0) {
      const active = cycles.find(c => c.is_active) || cycles[0];
      setActiveCycle(active);
    }
  }, [cycles]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const handleSelectMember = async (member) => {
    setSelectedMember(member);
    setIsCompleted(false);
    setShowQuestionSelector(false);

    let existingData = null;
    if (activeCycle) {
      try {
        const res = await fetch(`/api/submissions/${member.id}/${activeCycle.id}`);
        if (res.ok) {
          existingData = await res.json();
        }
      } catch (err) {
        console.error('Error fetching existing submission:', err);
      }
    }

    if (existingData) {
      setAnswers({
        general_updates: existingData.general_updates || '',
        wins_encouragements: existingData.wins_encouragements || '',
        challenges_obstacles: existingData.challenges_obstacles || '',
        budget_updates: existingData.budget_updates || '',
        elder_approval_items: existingData.elder_approval_items || '',
        prayer_requests: existingData.prayer_requests || ''
      });

      const restoredLog = [
        {
          sender: 'bot',
          text: `Welcome back, ${member.name}! 👋 I retrieved your saved updates for the ${activeCycle ? activeCycle.title : 'Elders Report'}.`
        }
      ];

      let lastAnsweredIdx = -1;
      QUESTIONS.forEach((q, idx) => {
        const val = existingData[q.key];
        if (val && val.trim() !== '') {
          lastAnsweredIdx = idx;
          restoredLog.push({
            sender: 'bot',
            text: `**${q.title}**\n${q.subtitle}`
          });
          restoredLog.push({
            sender: 'user',
            text: val
          });
        }
      });

      const nextIdx = lastAnsweredIdx + 1;
      if (nextIdx < QUESTIONS.length) {
        const nextQ = QUESTIONS[nextIdx];
        restoredLog.push({
          sender: 'bot',
          text: `Continuing with question ${nextIdx + 1} of ${QUESTIONS.length}:\n**${nextQ.title}**\n${nextQ.subtitle}`
        });
        setCurrentQuestionIndex(nextIdx);
      } else {
        setIsCompleted(true);
        restoredLog.push({
          sender: 'bot',
          text: `🎉 You have completed your updates! Use "Jump to Question" above to revise any specific section, or "Start Over" to clear and start fresh.`
        });
        setCurrentQuestionIndex(QUESTIONS.length);
      }
      setChatLog(restoredLog);
    } else {
      startFreshSurvey(member);
    }
  };

  const startFreshSurvey = (member) => {
    const targetMember = member || selectedMember;
    const firstQ = QUESTIONS[0];
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setShowQuestionSelector(false);
    setAnswers({
      general_updates: '',
      wins_encouragements: '',
      challenges_obstacles: '',
      budget_updates: '',
      elder_approval_items: '',
      prayer_requests: ''
    });
    setChatLog([
      {
        sender: 'bot',
        text: `Hello ${targetMember.name}! 👋 I am the BCoC Youth Ministry Coordinator Assistant serving alongside Talin Pepper.`
      },
      {
        sender: 'bot',
        text: `We are preparing our brief 5-10 minute presentation for the elders for the ${activeCycle ? activeCycle.title : 'upcoming meeting'}. Thank you for taking 5-7 minutes to keep your plans and needs visible!`
      },
      {
        sender: 'bot',
        text: `**${firstQ.title}**\n${firstQ.subtitle}`
      }
    ]);
  };

  const handleRestartSurvey = async () => {
    if (!window.confirm(`Are you sure you want to clear your updates and start the survey over from scratch?`)) return;

    if (selectedMember && activeCycle) {
      try {
        await fetch(`/api/submissions/${selectedMember.id}/${activeCycle.id}`, { method: 'DELETE' });
        if (onSubmissionComplete) onSubmissionComplete();
      } catch (err) {
        console.error('Failed to reset submission:', err);
      }
    }
    startFreshSurvey();
  };

  const handleJumpToQuestion = (qIndex) => {
    setShowQuestionSelector(false);
    setIsCompleted(false);
    setCurrentQuestionIndex(qIndex);
    const q = QUESTIONS[qIndex];
    
    setChatLog(prev => [
      ...prev,
      {
        sender: 'bot',
        text: `🔄 Switched to section ${qIndex + 1} of ${QUESTIONS.length}:\n**${q.title}**\n${q.subtitle}${answers[q.key] ? `\n\n*Current entry:* "${answers[q.key]}"` : ''}`
      }
    ]);
  };

  const handleSaveDraft = async () => {
    if (!selectedMember || !activeCycle) return;
    setIsDraftSaving(true);
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_member_id: selectedMember.id,
          cycle_id: activeCycle.id,
          ...answers,
          requires_elder_escalation: Boolean(
            answers.elder_approval_items && 
            answers.elder_approval_items.trim() !== '' && 
            answers.elder_approval_items.toLowerCase() !== 'none'
          )
        })
      });
      if (response.ok) {
        setDraftSavedMsg(true);
        setTimeout(() => setDraftSavedMsg(false), 3000);
        if (onSubmissionComplete) onSubmissionComplete();
      }
    } catch (err) {
      console.error('Draft save failed:', err);
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleSendAnswer = async () => {
    if (!currentInput.trim() && currentInput.toLowerCase() !== 'none') return;

    const answerText = currentInput.trim();
    const currentQ = QUESTIONS[currentQuestionIndex];

    const updatedAnswers = {
      ...answers,
      [currentQ.key]: answerText
    };
    setAnswers(updatedAnswers);

    const updatedLog = [
      ...chatLog,
      { sender: 'user', text: answerText }
    ];

    setChatLog(updatedLog);
    setCurrentInput('');

    // Auto-save
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_member_id: selectedMember.id,
          cycle_id: activeCycle.id,
          ...updatedAnswers,
          requires_elder_escalation: Boolean(
            updatedAnswers.elder_approval_items && 
            updatedAnswers.elder_approval_items.trim() !== '' && 
            updatedAnswers.elder_approval_items.toLowerCase() !== 'none'
          )
        })
      });
      if (onSubmissionComplete) onSubmissionComplete();
    } catch (e) {
      console.error('Auto-save error:', e);
    }

    if (isAskingFollowUp) {
      setIsAskingFollowUp(false);
      proceedToNextQuestion(currentQuestionIndex + 1, updatedLog, updatedAnswers);
      return;
    }

    setIsAiThinking(true);
    try {
      const res = await fetch('/api/ai/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionTitle: currentQ.title,
          questionSubtitle: currentQ.subtitle,
          userResponse: answerText,
          memberName: selectedMember.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.needsFollowUp && data.followUpQuestion) {
          setIsAskingFollowUp(true);
          setChatLog([
            ...updatedLog,
            {
              sender: 'bot',
              text: `✨ **Quick Follow-up:** ${data.followUpQuestion}`
            }
          ]);
          setIsAiThinking(false);
          return;
        }
      }
    } catch (err) {
      console.error('AI follow-up check error:', err);
    } finally {
      setIsAiThinking(false);
    }

    proceedToNextQuestion(currentQuestionIndex + 1, updatedLog, updatedAnswers);
  };

  const proceedToNextQuestion = (nextIndex, log, finalAnswers) => {
    if (nextIndex < QUESTIONS.length) {
      const nextQ = QUESTIONS[nextIndex];
      const newLog = [
        ...log,
        {
          sender: 'bot',
          text: `**${nextQ.title}**\n${nextQ.subtitle}`
        }
      ];
      setCurrentQuestionIndex(nextIndex);
      setChatLog(newLog);
    } else {
      setCurrentQuestionIndex(nextIndex);
      submitFinalAnswers(finalAnswers, log);
    }
  };

  const submitFinalAnswers = async (finalAnswers, finalLog) => {
    setIsSubmitting(true);
    const requiresEscalation = Boolean(
      finalAnswers.elder_approval_items && 
      finalAnswers.elder_approval_items.trim() !== '' && 
      finalAnswers.elder_approval_items.toLowerCase() !== 'none' &&
      finalAnswers.elder_approval_items.toLowerCase() !== 'n/a'
    );

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_member_id: selectedMember.id,
          cycle_id: activeCycle.id,
          ...finalAnswers,
          requires_elder_escalation: requiresEscalation
        })
      });

      if (response.ok) {
        setIsCompleted(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setChatLog([
          ...finalLog,
          {
            sender: 'bot',
            text: `🎉 **Thank you so much, ${selectedMember.name}!** Your updates have been successfully saved for Talin to review and present to the elders. You are all set!`
          }
        ]);
        if (onSubmissionComplete) onSubmissionComplete();
      }
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedMember) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            padding: '1rem',
            background: 'rgba(56, 189, 248, 0.15)',
            borderRadius: '50%',
            color: 'var(--accent-primary)',
            marginBottom: '1rem'
          }}>
            <MessageSquare size={36} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Youth Ministry Portal</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem' }}>
            Welcome! Please select your name below to share your brief ministry updates for the <strong>{activeCycle ? activeCycle.title : 'Elders Report'}</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {teamMembers.filter(m => m.role !== 'elder').map(member => (
              <button
                key={member.id}
                onClick={() => handleSelectMember(member)}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div style={{
                  padding: '0.5rem',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--accent-primary)',
                  borderRadius: '50%'
                }}>
                  <User size={20} />
                </div>
                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{member.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
        
        {/* Chat Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          background: 'rgba(15, 23, 42, 0.6)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              padding: '0.5rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              color: '#ffffff',
              borderRadius: '50%'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>Youth Ministry Assistant</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Reporting for: <strong>{selectedMember.name}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowQuestionSelector(!showQuestionSelector)}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Jump to any question to view or edit your response"
            >
              <Edit3 size={14} /> Jump to Question
            </button>

            <button
              onClick={handleRestartSurvey}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Clear all responses and restart survey"
            >
              <RotateCcw size={14} /> Start Over
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={isDraftSaving}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Save progress now to finish later"
            >
              <Save size={14} /> {draftSavedMsg ? 'Saved!' : 'Save'}
            </button>

            <button
              onClick={() => setSelectedMember(null)}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              Change Name
            </button>
          </div>
        </div>

        {/* Question Selector Overlay Panel */}
        {showQuestionSelector && (
          <div style={{
            background: 'var(--bg-dark)',
            padding: '1rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.5rem',
            animation: 'fade-in 0.2s ease-in-out'
          }}>
            {QUESTIONS.map((q, idx) => (
              <button
                key={q.key}
                onClick={() => handleJumpToQuestion(idx)}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: currentQuestionIndex === idx ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: '#ffffff',
                  textAlign: 'left',
                  fontSize: '0.825rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{idx + 1}. {q.title.split(' ')[1] || q.title}</span>
                {answers[q.key] ? <CheckCircle2 size={13} color="var(--accent-success)" /> : null}
              </button>
            ))}
          </div>
        )}

        {/* Chat Messages Log */}
        <div style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {chatLog.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '0.85rem',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {msg.sender === 'bot' && (
                <div style={{
                  padding: '0.5rem',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--accent-primary)',
                  borderRadius: '50%',
                  height: 'fit-content'
                }}>
                  <Bot size={18} />
                </div>
              )}

              <div style={{
                background: msg.sender === 'user'
                  ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)'
                  : 'var(--bg-card)',
                color: '#ffffff',
                padding: '1rem 1.25rem',
                borderRadius: '16px',
                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                border: msg.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                whiteSpace: 'pre-wrap',
                fontSize: '0.98rem'
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {isAiThinking && (
            <div style={{ display: 'flex', gap: '0.85rem', alignSelf: 'flex-start' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-primary)', borderRadius: '50%' }}>
                <Bot size={18} />
              </div>
              <div style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', padding: '0.75rem 1.25rem', borderRadius: '16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={16} className="animate-spin" /> Thinking...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        {!isCompleted ? (
          <div style={{
            padding: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(15, 23, 42, 0.6)'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <textarea
                value={currentInput}
                onChange={e => setCurrentInput(e.target.value)}
                placeholder="Type your update here... (or type 'None' if not applicable)"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAnswer();
                  }
                }}
                rows={2}
                style={{
                  flex: 1,
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  padding: '0.85rem 1rem',
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.95rem',
                  resize: 'none',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendAnswer}
                disabled={isSubmitting || isAiThinking}
                className="btn btn-primary"
                style={{ padding: '0 1.5rem', alignSelf: 'stretch' }}
              >
                <Send size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem', textAlign: 'center' }}>
              Tip: Press Enter to submit. Use "Jump to Question" above anytime to revise a section!
            </p>
          </div>
        ) : (
          <div style={{
            padding: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            background: 'rgba(52, 211, 153, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-success)', fontWeight: '600' }}>
              <CheckCircle2 size={20} /> Updates Saved & Complete!
            </div>
            <button
              onClick={() => setShowQuestionSelector(!showQuestionSelector)}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              <Edit3 size={15} /> Edit Answers
            </button>
            <button
              onClick={handleRestartSurvey}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              <RotateCcw size={15} /> Start Over
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
