import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits, Collection, MessageFlags } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { data, execute } from "./commands/index.js";
import { generateDependencyReport } from "@discordjs/voice";
import "./config/prism.config.js";

// Get guild limit from environment variable, default to 1 if not set
const guildLimit = process.env.GUILD_LIMIT ? parseInt(process.env.GUILD_LIMIT, 10) : 1;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();
client.commands.set("phishin", { execute });

client.once("ready", async () => {
  console.log(generateDependencyReport());

  console.log(`Bot is online as ${client.user.tag}`);
  console.log(`Guild limit: ${guildLimit}`);
  console.log(`Connected guilds: ${client.guilds.cache.size}`);

  // List up to 20 connected guilds
  const guilds = [...client.guilds.cache.values()];
  const guildsToShow = Math.min(guilds.length, 20);
  for (let i = 0; i < guildsToShow; i++) {
    const guild = guilds[i];
    console.log(` ${i + 1}. ${guild.name} (${guild.id})`);
  }
  if (guilds.length > 20) {
    console.log(` ... and ${guilds.length - 20} more guilds`);
  }

  // Check if we're already in more guilds than the limit
  if (client.guilds.cache.size > guildLimit) {
    console.log(`Exceeding guild limit (${guildLimit}). Leaving excess guilds...`);

    // Leave the oldest guilds until we're under the limit
    const sortedGuilds = [...client.guilds.cache.values()].sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
    for (let i = 0; i < sortedGuilds.length - guildLimit; i++) {
      const guild = sortedGuilds[i];
      console.log(`Leaving excess guild: ${guild.name} (${guild.id})`);
      await guild.leave();
    }
  }

  // Update global slash commands
  const commands = [data.toJSON()];
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log("Begin updating global slash commands");
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log("Done updating global slash commands");
  } catch (error) {
    console.error(error);
  }
});

// Handle new guild joins
client.on("guildCreate", async (guild) => {
  const currentGuildCount = client.guilds.cache.size;

  if (currentGuildCount > guildLimit) {
    console.log(`Guild limit (${guildLimit}) reached. Leaving guild: ${guild.name} (${guild.id})`);
    await guild.leave();
    return;
  }

  console.log(`Joined new guild: ${guild.name} (${guild.id}). Current guild count: ${currentGuildCount}/${guildLimit}`);
});

// Bot command handler
client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);

    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "There was an error executing this command!",
          flags: MessageFlags.Ephemeral
        });
      } else if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({
          content: "There was an error executing this command!"
        });
      }
    } catch (replyError) {
      console.error("Error sending error message:", replyError);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
