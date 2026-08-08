const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load .env variables
const db = require('./db');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Gemini API client if API key is provided
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai = null;
if (geminiApiKey && geminiApiKey.trim() !== '') {
  ai = new GoogleGenAI({ apiKey: geminiApiKey });
  console.log('Gemini AI client successfully initialized with API key!');
} else {
  console.log('Running without GEMINI_API_KEY (AI features disabled until key is added in .env)');
}

// API Routes

// 1. Get all team members (coordinators, ministers, deacons, elders, spouses)
app.get('/api/team', (req, res) => {
  try {
    const team = db.prepare(`
      SELECT *, 
        substr(name, instr(name, ' ') + 1) as last_name
      FROM team_members 
      ORDER BY last_name ASC, role DESC, name ASC
    `).all();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get active & available reporting cycles
app.get('/api/cycles', (req, res) => {
  try {
    const cycles = db.prepare('SELECT * FROM reporting_cycles ORDER BY due_date ASC').all();
    res.json(cycles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get submission status for a cycle (for Coordinator Dashboard)
app.get('/api/cycles/:cycleId/status', (req, res) => {
  const { cycleId } = req.params;
  try {
    const team = db.prepare("SELECT * FROM team_members WHERE role != 'elder' ORDER BY name ASC").all();
    const submissions = db.prepare('SELECT * FROM submissions WHERE cycle_id = ?').all(cycleId);

    const submissionMap = new Map();
    submissions.forEach(sub => submissionMap.set(sub.team_member_id, sub));

    const statusList = team.map(member => ({
      member,
      submitted: submissionMap.has(member.id),
      submission: submissionMap.get(member.id) || null
    }));

    res.json(statusList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. AI Follow-up generator endpoint
app.post('/api/ai/followup', async (req, res) => {
  const { questionTitle, questionSubtitle, userResponse, memberName } = req.body;

  if (!userResponse || userResponse.trim().toLowerCase() === 'none' || userResponse.trim().toLowerCase() === 'n/a' || userResponse.length < 15) {
    return res.json({ needsFollowUp: false, followUpQuestion: null });
  }

  if (!ai) {
    // If Gemini key is not set, skip AI follow-up gracefully
    return res.json({ needsFollowUp: false, followUpQuestion: null });
  }

  try {
    const prompt = `You are an AI Assistant helping Talin Pepper, Youth Ministry Deacon Coordinator at BCoC.
A team member named ${memberName} answered the following survey question:
Question Category: ${questionTitle} (${questionSubtitle})
User's Answer: "${userResponse}"

Evaluate if their answer is brief or mentions a need, challenge, or event where 1 quick, polite clarifying follow-up question would help gather better details for the elders presentation.
If a follow-up would add value, return JSON: {"needsFollowUp": true, "followUpQuestion": "Your polite, warm follow-up question here"}.
If the user's answer is already thorough or complete, return JSON: {"needsFollowUp": false, "followUpQuestion": null}.
Only output raw JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const text = response.text;
    const cleanJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const parsed = JSON.parse(cleanJson);
    res.json(parsed);
  } catch (err) {
    console.error('Gemini follow-up error:', err);
    res.json({ needsFollowUp: false, followUpQuestion: null });
  }
});

// 4b. Get existing submission/draft for a specific team member and cycle
app.get('/api/submissions/:memberId/:cycleId', (req, res) => {
  const { memberId, cycleId } = req.params;
  try {
    const submission = db.prepare('SELECT * FROM submissions WHERE team_member_id = ? AND cycle_id = ?')
      .get(memberId, cycleId);
    res.json(submission || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4c. Delete/Restart submission for a specific team member and cycle
app.delete('/api/submissions/:memberId/:cycleId', (req, res) => {
  const { memberId, cycleId } = req.params;
  try {
    db.prepare('DELETE FROM submissions WHERE team_member_id = ? AND cycle_id = ?').run(memberId, cycleId);
    res.json({ message: 'Submission reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Save or update a deacon/minister/coordinator submission
app.post('/api/submissions', (req, res) => {
  const {
    team_member_id,
    cycle_id,
    general_updates,
    wins_encouragements,
    challenges_obstacles,
    budget_updates,
    elder_approval_items,
    prayer_requests,
    requires_elder_escalation
  } = req.body;

  if (!team_member_id || !cycle_id) {
    return res.status(400).json({ error: 'Team member ID and Cycle ID are required.' });
  }

  try {
    const existing = db.prepare('SELECT id FROM submissions WHERE team_member_id = ? AND cycle_id = ?')
      .get(team_member_id, cycle_id);

    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE submissions SET
          general_updates = ?,
          wins_encouragements = ?,
          challenges_obstacles = ?,
          budget_updates = ?,
          elder_approval_items = ?,
          prayer_requests = ?,
          requires_elder_escalation = ?,
          submitted_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateStmt.run(
        general_updates || '',
        wins_encouragements || '',
        challenges_obstacles || '',
        budget_updates || '',
        elder_approval_items || '',
        prayer_requests || '',
        requires_elder_escalation ? 1 : 0,
        existing.id
      );
      res.json({ message: 'Submission updated successfully', id: existing.id });
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO submissions (
          team_member_id, cycle_id, general_updates, wins_encouragements,
          challenges_obstacles, budget_updates, elder_approval_items,
          prayer_requests, requires_elder_escalation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = insertStmt.run(
        team_member_id,
        cycle_id,
        general_updates || '',
        wins_encouragements || '',
        challenges_obstacles || '',
        budget_updates || '',
        elder_approval_items || '',
        prayer_requests || '',
        requires_elder_escalation ? 1 : 0
      );
      res.json({ message: 'Submission saved successfully', id: result.lastInsertRowid });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Get compiled & AI-polished 5-10 minute presentation summary for Elders
app.get('/api/cycles/:cycleId/summary', async (req, res) => {
  const { cycleId } = req.params;
  try {
    const cycle = db.prepare('SELECT * FROM reporting_cycles WHERE id = ?').get(cycleId);
    const submissions = db.prepare(`
      SELECT s.*, t.name as member_name, t.role, t.sub_role, t.phone
      FROM submissions s
      JOIN team_members t ON s.team_member_id = t.id
      WHERE s.cycle_id = ?
      ORDER BY t.role DESC, t.name ASC
    `).all(cycleId);

    const totalExpected = db.prepare("SELECT COUNT(*) as cnt FROM team_members WHERE role != 'elder'").get().cnt;

    let aiPolishedSummary = null;

    if (ai && submissions.length > 0) {
      try {
        const rawContent = JSON.stringify(submissions, null, 2);
        const aiPrompt = `You are an expert executive assistant preparing a 5-10 minute Elders Presentation for the BCoC Youth Ministry.
Here are the raw survey responses submitted by the youth ministers, deacon coordinator, and deacons:
${rawContent}

Tasks:
1. Fix all grammar, spelling, typos, and formatting syntax.
2. Synthesize all individual updates into a cohesive, highly professional executive presentation summary.
3. Categorize into 5 distinct clear sections:
   - 🌟 Executive Overview & Key Wins
   - 📅 General Updates & Upcoming Schedule
   - ⚠️ Hurdles, Challenges & Resource Needs
   - ✋ Items Requiring Elder Decision / Guidance
   - 🙏 Ministry & Family Prayer Requests
4. Ensure tone is respectful, encouraging, and clear for elders. Output in Markdown format.`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: aiPrompt
        });
        aiPolishedSummary = aiResponse.text;
      } catch (aiErr) {
        console.error('Gemini presentation summary error:', aiErr);
      }
    }

    res.json({
      cycle,
      totalExpected,
      totalReceived: submissions.length,
      submissions,
      aiPolishedSummary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`BCoC Deacon Coordinator Backend running on http://localhost:${PORT}`);
});
