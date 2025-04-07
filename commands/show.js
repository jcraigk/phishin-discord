import { EmbedBuilder, MessageFlags } from "discord.js";
import { parseFlexibleDate, formatDate } from "../utils/timeUtils.js";
import { fetchRandomShow, fetchShow } from "../services/phishinAPI.js";

export default async function handleShow(interaction) {
  const dateInput = interaction.options.getString("date");

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    let showData;
    let isRandom = false;

    if (!dateInput) {
      const randomShowResponse = await fetchRandomShow();
      if (randomShowResponse.notFound) {
        await interaction.editReply("❌ Show not found");
        return;
      }
      showData = randomShowResponse;
      isRandom = true;
    } else {
      const parsedDate = parseFlexibleDate(dateInput);

      if (!parsedDate) {
        await interaction.editReply(`❌ "${dateInput}" isn't a valid date. Please use YYYY-MM-DD format.`);
        return;
      }

      const showResponse = await fetchShow(parsedDate);

      if (showResponse.notFound) {
        await interaction.editReply("❌ Show not found.");
        return;
      }

      showData = showResponse;
    }

    const totalSeconds = Math.floor(showData.duration / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const durationDisplay = hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes}m ${seconds}s`;

    let setlistDisplay = `**${showData.venue_name} - ${showData.venue.location}**\n`;
    setlistDisplay += `${durationDisplay}\n`;

    let lastSetName = null;

    showData.tracks.forEach((track) => {
      const currentSetName = track.set_name || "Unknown Set";

      if (currentSetName !== lastSetName) {
        let formattedSetName = currentSetName;

        if (currentSetName.toLowerCase() === "e") {
          formattedSetName = "Encore";
        } else if (currentSetName.match(/^set\s*\d+$/i)) {
          formattedSetName = "Set " + currentSetName.replace(/^set\s*(\d+)$/i, "$1");
        }

        setlistDisplay += `\n**${formattedSetName}:**\n`;
        lastSetName = currentSetName;
      }

      setlistDisplay += `[${track.title}](https://phish.in/${showData.date}/${track.slug})\n`;
    });

    const albumArtUrl = showData.cover_art_urls?.medium || null;
    let embedTitle = `Phish - ${formatDate(showData.date)}`;
    isRandom && (embedTitle = `🎲 ${embedTitle}`);

    const embed = new EmbedBuilder()
      .setTitle(embedTitle)
      .setDescription(setlistDisplay)
      .setColor("#1DB954")
      .setURL(`https://phish.in/${showData.date}`);

    if (albumArtUrl) {
      embed.setThumbnail(albumArtUrl);
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    // console.error("Error fetching show information:", error);
    await interaction.editReply("❌ Network error - could not fetch data");
  }
}
