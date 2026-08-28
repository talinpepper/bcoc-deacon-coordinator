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
    role TEXT NOT NULL, -- 'coordinator', 'minister', 'deacon', 'elder', 'spouse'
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

// Function to upsert/sync roster members
function syncMember(name, role, subRole, phone) {
  const existing = db.prepare('SELECT id FROM team_members WHERE name LIKE ?').get(name);
  if (existing) {
    db.prepare('UPDATE team_members SET role = ?, sub_role = ?, phone = ? WHERE id = ?')
      .run(role, subRole, phone, existing.id);
  } else {
    db.prepare('INSERT INTO team_members (name, role, sub_role, phone) VALUES (?, ?, ?, ?)')
      .run(name, role, subRole, phone);
  }
}

// 1. Coordinators & Ministers
syncMember('Talin Pepper', 'coordinator', 'Youth Ministry Deacon Coordinator', '806-787-7053');
syncMember('Mason Hill', 'minister', 'High School Youth Minister', '254-424-4366');
syncMember('Dylan Holland', 'minister', 'Junior High Youth Minister', '479-387-1175');

// 2. Elders
syncMember('Carter Mahanay', 'elder', 'Assigned Youth Elder', '817-944-3362');
syncMember('Scott Barkley', 'elder', 'Assigned Youth Elder', '817-995-1546');

// 3. Deacons
syncMember('John Barkley', 'deacon', 'Youth Deacon', '817-223-9965');
syncMember('Chris Farmer', 'deacon', 'Youth Deacon', '817-657-3117');
syncMember('Nat Killpatrick', 'deacon', 'Youth Deacon', '214-206-6823');
syncMember('Tim Mellott', 'deacon', 'Youth Deacon', '817-300-2370');
syncMember('Mark Simmons', 'deacon', 'Youth Deacon', '817-718-8441');
syncMember('Josh Smith', 'deacon', 'Youth Deacon', '469-323-6962');
syncMember('Clint Walker', 'deacon', 'Youth Deacon', '214-766-3931');
syncMember('Luke Williams', 'deacon', 'Youth Deacon', '817-395-2547');

// 4. Wives
syncMember('Amanda Pepper', 'spouse', 'Youth Ministry Wife', '817-999-6329');
syncMember('Tara Barkley', 'spouse', 'Youth Ministry Wife', '817-454-2820');
syncMember('Ashley Farmer', 'spouse', 'Youth Ministry Wife', '817-657-3127');
syncMember('Anna Hill', 'spouse', 'Youth Ministry Wife', '806-292-4458');
syncMember('Abby Holland', 'spouse', 'Youth Ministry Wife', '940-867-0210');
syncMember('Stacey Killpatrick', 'spouse', 'Youth Ministry Wife', '817-559-5294');
syncMember('Gina Mellott', 'spouse', 'Youth Ministry Wife', '817-939-1424');
syncMember('Lindsay Simmons', 'spouse', 'Youth Ministry Wife', '972-762-1182');
syncMember('Amber Smith', 'spouse', 'Youth Ministry Wife', '817-991-1189');
syncMember('Heather Walker', 'spouse', 'Youth Ministry Wife', '682-552-8911');
syncMember('Linsay Williams', 'spouse', 'Youth Ministry Wife', '817-395-2546');

// Ensure December Presentation cycle exists and set as active
const decCycle = db.prepare("SELECT id FROM reporting_cycles WHERE title LIKE '%December%'").get();
if (decCycle) {
  db.prepare('UPDATE reporting_cycles SET is_active = 0').run();
  db.prepare('UPDATE reporting_cycles SET is_active = 1 WHERE id = ?').run(decCycle.id);
} else {
  db.prepare('UPDATE reporting_cycles SET is_active = 0').run();
  db.prepare("INSERT INTO reporting_cycles (title, due_date, is_active) VALUES ('December 2026 Presentation', '2026-12-16', 1)").run();
}

module.exports = db;
