import { EmbedBuilder } from "discord.js";
import { parseFlexibleDate, formatDate } from "../utils/dateUtils.js";
import { fetchRandomShow, fetchShow } from "../services/phishinAPI.js";

export default async function handleShow(interaction) {
  const dateInput = interaction.options.getString("date");

  await interaction.deferReply();

  try {
    let showData;

    if (!dateInput) {
      const randomShowResponse = await fetchRandomShow();
      showData = randomShowResponse;
    } else {
      const parsedDate = parseFlexibleDate(dateInput);

      if (!parsedDate) {
        await interaction.editReply(`❌ "${dateInput}" isn't a valid date. Please use YYYY-MM-DD format.`);
        return;
      }

      const formattedDate = formatDate(parsedDate);

      const showResponse = await fetchShow(formattedDate);
      showData = showResponse;
    }

    // Calculate the total duration in hours, minutes, and seconds
    const totalSeconds = Math.floor(showData.duration / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format the duration
    const durationDisplay = hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes}m ${seconds}s`;

    let setlistDisplay = `**${showData.venue_name} - ${showData.venue.location}**\n`;
    setlistDisplay += `[▶️](https://phish.in/${showData.date})   ${durationDisplay}\n`;

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

      setlistDisplay += `${track.title}\n`;
    });

    // Fetch the smallest album art thumbnail
    const albumArtUrl = showData.cover_art_urls?.medium || null;

    // Create an embed with thumbnail
    const embed = new EmbedBuilder()
      .setTitle(`Phish - ${formatDate(showData.date)}`)
      .setDescription(setlistDisplay)
      .setColor("#1DB954")
      .setURL(`https://phish.in/${showData.date}`);

    if (albumArtUrl) {
      embed.setThumbnail(albumArtUrl);
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error("Error fetching show information:", error);
    await interaction.editReply("❌ Network error - could not fetch data");
  }
}
