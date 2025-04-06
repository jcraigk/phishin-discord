import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits, Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { data, execute } from "./commands/index.js";

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

  // await client.application.commands.set([]); // Delet existing global commands

  try {
    console.log("Begin updating application slash commands");

    // TODO: Switch back to global commands
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("Done updating application slash commands");
  } catch (error) {
    console.error(error);
  }
});

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
