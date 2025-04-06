import { MessageFlags } from "discord.js";
import { parseFlexibleDate, formatDate, isExactYear } from "../utils/dateUtils.js";
import { getRandomShow } from "../services/phishinAPI.js";

export default async function handlePlay(interaction, client) {
  const query = interaction.options.getString("query");

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply({
      content: "You need to be in a voice channel to play music!",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await interaction.deferReply();

  const currentShow = client.shows?.get(interaction.guild.id);
  if (!query && currentShow && currentShow.isPaused) {
    await handleResumePlayback(interaction, client);
    return;
  }

  if (!query) {
    await handleRandomShow(interaction, client);
  } else if (isExactYear(query)) {
    await handleYearShow(interaction, query, client);
  } else {
    const parsedDate = parseFlexibleDate(query);

    if (parsedDate) {
      const formattedDate = formatDate(parsedDate);
      await handleDateShow(interaction, formattedDate, client);
    } else {
      await handleSearch(interaction, query, client);
    }
  }
}

async function handleRandomShow(interaction, client) {
  await interaction.editReply("Playing a random show...");
}

async function handleYearShow(interaction, year, client) {
  await interaction.editReply(`Playing a random show from ${year}...`);
}

async function handleDateShow(interaction, date, client) {
  await interaction.editReply(`Playing show from ${date}...`);
}

async function handleSearch(interaction, query, client) {
  await interaction.editReply(`Searching for "${query}"...`);
}

async function handleResumePlayback(interaction, client) {
  const currentShow = client.shows?.get(interaction.guild.id);

  if (!currentShow || !currentShow.player) {
    await handleRandomShow(interaction, client);
    return;
  }

  try {
    currentShow.player.unpause();
    currentShow.isPaused = false;
    client.shows.set(interaction.guild.id, currentShow);

    await interaction.editReply("Resuming playback.");
  } catch (error) {
    console.error("Error resuming playback:", error);
    await interaction.editReply("An error occurred while trying to resume playback.");
  }
}
