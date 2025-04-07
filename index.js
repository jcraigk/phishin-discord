import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits, Collection, MessageFlags } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { data, execute } from "./commands/index.js";
import db from "./db/index.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();
client.commands.set("phishin", { execute });

client.once("ready", async () => {
  console.log(`Bot is online as ${client.user.tag}`);

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

// Track when bot is added to a guild
client.on("guildCreate", async (guild) => {
  try {
    console.log(`Bot added to guild: ${guild.name} (${guild.id})`);
    await db.addGuild(guild.id, guild.name, guild.memberCount);
  } catch (error) {
    console.error('Error handling guild creation:', error);
  }
});

// Track when bot is removed from a guild
client.on("guildDelete", async (guild) => {
  try {
    console.log(`Bot removed from guild: ${guild.name} (${guild.id})`);
    await db.removeGuild(guild.id);
  } catch (error) {
    console.error('Error handling guild deletion:', error);
  }
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

    // Try to respond to the interaction if it hasn't been responded to yet
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
