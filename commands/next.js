import { MessageFlags } from "discord.js";
import { createAudioResource } from "@discordjs/voice";

export default async function handleNextTrack(interaction, client) {
  const currentShow = client.shows?.get(interaction.guild.id);

  if (!currentShow || !currentShow.player || currentShow.currentIndex >= currentShow.playlist.length) {
    await interaction.reply({
      content: "❌ There's nothing currently playing or no more tracks to skip",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    currentShow.currentIndex++;

    if (currentShow.currentIndex < currentShow.playlist.length) {
      const track = currentShow.playlist[currentShow.currentIndex];
      const trackUrl = track.mp3_url;
      const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;

      if (trackUrl) {
        const resource = createAudioResource(trackUrl);
        currentShow.player.play(resource);

        await interaction.reply({
          content: `⏩ Next track: ${track.title} - ${currentShow.formattedDate} - \`${trackLink}\``,
          flags: MessageFlags.Ephemeral
        });
      } else {
        await handleNextTrack(interaction, client);
      }
    } else {
      await interaction.reply({
        content: "❌ You've reached the end of the playlist",
        flags: MessageFlags.Ephemeral
      });
    }
  } catch (error) {
    console.error("Error skipping track:", error);
    await interaction.reply({
      content: "❌ An error occurred while trying to skip to the next track",
      flags: MessageFlags.Ephemeral
    });
  }
}
