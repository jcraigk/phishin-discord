import { MessageFlags } from "discord.js";
import { createAudioResource } from "@discordjs/voice";

export default async function handlePreviousTrack(interaction, client) {
  const currentShow = client.shows?.get(interaction.guild.id);

  if (!currentShow || !currentShow.player || currentShow.currentIndex <= 0) {
    await interaction.reply({
      content: "❌ There's no previous track to skip to",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    currentShow.currentIndex--;

    if (currentShow.currentIndex >= 0) {
      const track = currentShow.playlist[currentShow.currentIndex];
      const trackUrl = track.mp3_url;
      const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;

      if (trackUrl) {
        const resource = createAudioResource(trackUrl);
        currentShow.player.play(resource);

        await interaction.reply({
          content: `⏪ Previous track: ${track.title} - ${currentShow.formattedDate} - \`${trackLink}\``,
          flags: MessageFlags.Ephemeral
        });
      } else {
        await handlePreviousTrack(interaction, client);
      }
    } else {
      await interaction.reply({
        content: "❌ You've reached the beginning of the playlist",
        flags: MessageFlags.Ephemeral
      });
    }
  } catch (error) {
    console.error("Error skipping to previous track:", error);
    await interaction.reply({
      content: "❌ An error occurred while trying to go to the previous track",
      flags: MessageFlags.Ephemeral
    });
  }
}
