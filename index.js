require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();

// Command registration
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Ready event
client.once("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);

  // Register commands with Discord API
  const { REST } = require("@discordjs/rest");
  const { Routes } = require("discord-api-types/v10");

  const commands = [];
  commandFiles.forEach(file => {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  });

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  (async () => {
    try {
      console.log("Started refreshing application (/) commands.");

      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      );

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  })();
});

// Command handling
client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error executing this command!",
      ephemeral: true
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
