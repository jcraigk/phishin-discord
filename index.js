import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits, Collection, MessageFlags } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { data, execute } from "./commands/index.js";
import { generateDependencyReport } from "@discordjs/voice";
import { execSync } from 'node:child_process';
import prism from "prism-media";

// Configure prism to use system ffmpeg
const ffmpegPath = process.env.IN_DOCKER ? "/usr/bin/ffmpeg" : (process.env.FFMPEG_PATH || "/usr/bin/ffmpeg");

const getFFmpegInfo = () => {
  try {
    const output = execSync(`${ffmpegPath} -version`).toString();
    const versionLine = output.split("\n")[0];
    const version = versionLine.split(" ").slice(2, 3).join(" ");

    return {
      command: ffmpegPath,
      output,
      version
    };
  } catch (error) {
    console.error(`Error getting FFmpeg info: ${error.message}`);
    console.error(`FFmpeg path: ${ffmpegPath}`);
    console.error(`Please check if FFmpeg is installed and the path is correct.`);

    // Return a fallback object
    return {
      command: ffmpegPath,
      output: "FFmpeg info not available",
      version: "unknown"
    };
  }
};

prism.FFmpeg.getInfo = () => getFFmpegInfo();

// Default to guild limit of 1 if GUILD_LIMIT is not set
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
  // console.log(generateDependencyReport());

  console.log(`Bot is online as ${client.user.tag}`);
  console.log(`Guild limit: ${guildLimit}`);

  // List up to 20 connected guilds
  console.log(`Connected guilds: ${client.guilds.cache.size}`);
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
dokku checks:disable phishin-discord worker

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
  await command.execute(interaction, client);
});

client.login(process.env.DISCORD_TOKEN);
