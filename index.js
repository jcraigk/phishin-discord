import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits, Collection, MessageFlags } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { data, execute } from "./commands/index.js";
import { generateDependencyReport } from "@discordjs/voice";
import { execSync } from 'node:child_process';
import prism from "prism-media";

prism.FFmpeg.getInfo = () => ({
  command: "/usr/bin/ffmpeg",
  output: execSync("/usr/bin/ffmpeg -version").toString(),
  version: "patched"
});

// Ensure FFMPEG_PATH is correctly set to the system ffmpeg
process.env.FFMPEG_PATH = "/usr/bin/ffmpeg"; // Adjust this path if needed
process.env.FFMPEG_BINARY = "/usr/bin/ffmpeg"; // Adjust this path if needed

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
  try {
    const info = await new prism.FFmpeg({
      args: ['-version'],
      shell: false,
      executable: process.env.FFMPEG_PATH
    });
    console.log("FFmpeg Info:", info);
  } catch (error) {
    console.error("Error fetching FFmpeg info:", error);
  }

  console.log("FFmpeg Path:", execSync('which ffmpeg').toString().trim());
  console.log("FFmpeg Version:", execSync('ffmpeg -version').toString().split("\n")[0]);
  console.log("Node PATH:", process.env.PATH);
  console.log("Node FFMPEG_PATH:", process.env.FFMPEG_PATH);
  console.log("Node FFMPEG_BINARY:", process.env.FFMPEG_BINARY);

  console.log(generateDependencyReport());
  console.log(`Bot is online as ${client.user.tag}`);
  console.log(`Guild limit set to: ${guildLimit}`);

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
