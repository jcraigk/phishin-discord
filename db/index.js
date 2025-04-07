import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '../database.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS guilds (
    guild_id TEXT PRIMARY KEY,
    guild_name TEXT,
    installed_at DATETIME,
    uninstalled_at DATETIME,
    member_count INTEGER,
    is_active BOOLEAN DEFAULT 1
  );
`);

console.log('Database initialized');

const statements = {
  addGuild: db.prepare(`
    INSERT INTO guilds (guild_id, guild_name, installed_at, member_count)
    VALUES (?, ?, ?, ?)
  `),

  updateGuild: db.prepare(`
    UPDATE guilds
    SET uninstalled_at = ?, is_active = 0
    WHERE guild_id = ?
  `),

  getActiveGuildCount: db.prepare(`
    SELECT COUNT(*) as count FROM guilds WHERE is_active = 1
  `),

  getAllGuilds: db.prepare(`
    SELECT * FROM guilds ORDER BY installed_at DESC
  `)
};

const dbFunctions = {
  addGuild: (guildId, guildName, memberCount) => {
    return statements.addGuild.run(guildId, guildName, new Date(), memberCount);
  },

  removeGuild: (guildId) => {
    return statements.updateGuild.run(new Date(), guildId);
  },

  getActiveGuildCount: () => {
    return statements.getActiveGuildCount.get().count;
  }
};

export default dbFunctions;
