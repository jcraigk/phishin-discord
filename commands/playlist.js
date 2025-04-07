import { MessageFlags } from "discord.js";
import { formatDate, formatDuration } from "../utils/timeUtils.js";

export default async function handlePlaylist(interaction, client) {
  await displayPlaylist(interaction, client);
}

async function displayPlaylist(interaction, client) {
  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
    await interaction.reply({
      content: "The playlist is currently empty",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const trackList = playlist.tracks
    .map((track, index) => {
      const trackInfo = `${index + 1}. ${track.title} - ${formatDate(track.show_date)} (${formatDuration(track.duration, "colons")})`;
      return index === playlist.currentIndex ? `${trackInfo}  [NOW PLAYING]` : trackInfo;
    })
    .join("\n");

  const totalDurationMs = playlist.tracks.reduce((sum, track) => sum + track.duration, 0);

  await interaction.reply({
    content: `**Current Playlist in 🔊 ${playlist.voiceChannelName} (${formatDuration(totalDurationMs)}):**\n${trackList}`,
    flags: MessageFlags.Ephemeral
  });
}
