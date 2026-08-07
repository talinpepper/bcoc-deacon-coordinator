const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Support persistent disk path on cloud platforms (e.g. Render /var/data)
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'deacon_reports.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'coordinator', 'minister', 'deacon', 'elder'
    sub_role TEXT, -- e.g., 'Youth Ministry Deacon Coordinator', 'High School Youth Minister'
    phone TEXT NOT NULL,
    email TEXT
  );

  CREATE TABLE IF NOT EXISTS reporting_cycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL, -- e.g., 'August 26, 2026 Presentation'
    due_date TEXT NOT NULL, -- YYYY-MM-DD
    is_active INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_member_id INTEGER NOT NULL,
    cycle_id INTEGER NOT NULL,
    general_updates TEXT,
    wins_encouragements TEXT,
    challenges_obstacles TEXT,
    budget_updates TEXT,
    elder_approval_items TEXT,
    prayer_requests TEXT,
    requires_elder_escalation INTEGER DEFAULT 0,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(team_member_id) REFERENCES team_members(id),
    FOREIGN KEY(cycle_id) REFERENCES reporting_cycles(id)
  );
`);

// Check if Talin Pepper exists, if not insert
const talinStmt = db.prepare("SELECT COUNT(*) as cnt FROM team_members WHERE name LIKE '%Talin Pepper%'");
const talinExists = talinStmt.get().cnt;

if (talinExists === 0) {
  const insertTeam = db.prepare(`
    INSERT INTO team_members (name, role, sub_role, phone) VALUES (?, ?, ?, ?)
  `);
  insertTeam.run('Talin Pepper', 'coordinator', 'Youth Ministry Deacon Coordinator', '817-999-6329');
} else {
  db.prepare("UPDATE team_members SET phone = '817-999-6329' WHERE name LIKE '%Talin Pepper%'").run();
}

// Seed Initial Data if empty
const count = db.prepare('SELECT COUNT(*) as cnt FROM team_members').get().cnt;

if (count <= 1) { // Only Talin or empty
  const insertTeam = db.prepare(`
    INSERT INTO team_members (name, role, sub_role, phone) VALUES (?, ?, ?, ?)
  `);

  // Youth Ministers
  insertTeam.run('Mason Hill', 'minister', 'High School Youth Minister', '254-424-4366');
  insertTeam.run('Dylan Holland', 'minister', 'Junior High Youth Minister', '479-387-1175');

  // Elders
  insertTeam.run('Carter Mahanay', 'elder', 'Assigned Youth Elder', '817-944-3362');
  insertTeam.run('Scott Barkley', 'elder', 'Assigned Youth Elder', '817-995-1546');

  // Youth Deacons
  insertTeam.run('John Barkley', 'deacon', 'Youth Deacon', '817-223-9965');
  insertTeam.run('Chris Farmer', 'deacon', 'Youth Deacon', '817-657-3117');
  insertTeam.run('Nat Killpatrick', 'deacon', 'Youth Deacon', '214-206-6823');
  insertTeam.run('Tim Mellott', 'deacon', 'Youth Deacon', '817-300-2370');
  insertTeam.run('Mark Simmons', 'deacon', 'Youth Deacon', '817-718-8441');
  insertTeam.run('Josh Smith', 'deacon', 'Youth Deacon', '469-323-6962');
  insertTeam.run('Clint Walker', 'deacon', 'Youth Deacon', '214-766-3931');
  insertTeam.run('Luke Williams', 'deacon', 'Youth Deacon', '817-395-2547');
}

// Seed Initial Cycles if empty
const cycleCount = db.prepare('SELECT COUNT(*) as cnt FROM reporting_cycles').get().cnt;
if (cycleCount === 0) {
  const insertCycle = db.prepare(`
    INSERT INTO reporting_cycles (title, due_date, is_active) VALUES (?, ?, ?)
  `);
  insertCycle.run('August 26th Report', '2026-08-26', 1);
  insertCycle.run('December Report', '2026-12-26', 0);
  insertCycle.run('April Report', '2027-04-26', 0);
}

module.exports = db;
