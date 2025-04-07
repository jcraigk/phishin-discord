import db from './db/index.js';

// Add some helper functions
const helpers = {
  activeGuilds: () => {
    const count = db.getActiveGuildCount();
    console.log(`Active guilds: ${count}`);
    return count;
  },

  guildCommands: (guildId) => {
    const commands = db.getCommandsForGuild(guildId);
    console.log(JSON.stringify(commands, null, 2));
    return commands;
  }
};

// Start a custom REPL
import repl from 'repl';

const r = repl.start({
  prompt: 'db> ',
  useGlobal: false
});

// Add helpers to the REPL context
Object.assign(r.context, helpers);
Object.assign(r.context, db);

console.log('Database REPL started. Available commands:');
console.log('- activeGuilds()');
console.log('- guildCommands(guildId)');
console.log('- db.logCommand(guildId, command)');
