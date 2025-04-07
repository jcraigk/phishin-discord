import { MessageFlags } from "discord.js";
import { createAudioResource } from "@discordjs/voice";
import { formatDate } from "../utils/timeUtils.js";

export default async function handleNextTrack(interaction, client) {
  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.player || playlist.currentIndex >= playlist.tracks.length) {
    await interaction.reply({
      content: "❌ There's nothing currently playing or no more tracks to skip",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    playlist.currentIndex++;

    if (playlist.currentIndex < playlist.tracks.length) {
      const track = playlist.tracks[playlist.currentIndex];
      const trackUrl = track.mp3_url;
      const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;

      if (trackUrl) {
        const resource = createAudioResource(trackUrl);
        playlist.player.play(resource);

        await interaction.reply({
          content: `Next track in 🔊 **${playlist.voiceChannelName}**: ${track.title} - ${formatDate(track.show_date)}`,
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
      content: "❌ Track skip failed",
      flags: MessageFlags.Ephemeral
    });
  }
}
