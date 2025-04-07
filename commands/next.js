import { MessageFlags } from "discord.js";
import { createAudioResource } from "@discordjs/voice";

export default async function handleNextTrack(interaction, client) {
  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.player || playlist.currentIndex >= playlist.playlist.length) {
    await interaction.reply({
      content: "❌ There's nothing currently playing or no more tracks to skip",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    playlist.currentIndex++;

    if (playlist.currentIndex < playlist.playlist.length) {
      const track = playlist.playlist[playlist.currentIndex];
      const trackUrl = track.mp3_url;
      const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;

      if (trackUrl) {
        const resource = createAudioResource(trackUrl);
        playlist.player.play(resource);

        await interaction.reply({
          content: `⏩ Next track: ${track.title} - ${playlist.formattedDate} - \`${trackLink}\``,
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
