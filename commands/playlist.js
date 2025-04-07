import { EmbedBuilder, MessageFlags } from "discord.js";
import { AudioPlayerStatus } from "@discordjs/voice";
import { formatDate, formatDuration } from "../utils/timeUtils.js";

function formatTrack(track, index, isNowPlaying = false) {
  const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;
  const trackInfo = `${index + 1}. [${track.title}](https://phish.in/${track.show_date}/${track.slug}) - [${formatDate(track.show_date)}](https://phish.in/${track.show_date}) (${formatDuration(track.duration, "colons")})`;
  return isNowPlaying ? `${trackInfo} [NOW PLAYING]` : trackInfo;
}

export default async function displayPlaylist(interaction, client) {
  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
    await interaction.reply({
      content: "The playlist is currently empty",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await interaction.deferReply();

  const totalDurationMs = playlist.tracks.reduce((sum, track) => sum + track.duration, 0);
  const currentIndex = playlist.currentIndex;
  const totalTracks = playlist.tracks.length;

  // Calculate the range of tracks to display
  const startBefore = Math.max(0, currentIndex - 3);
  const endAfter = Math.min(totalTracks, currentIndex + 11); // +11 to include current track
  const showEndTracks = endAfter < totalTracks - 3;
  const endIndex = showEndTracks ? totalTracks - 3 : endAfter;

  // Build the track list
  let trackList = [];

  // Add tracks before current track
  if (startBefore > 0) {
    trackList.push("...");
  }

  // Add tracks before current track
  for (let i = startBefore; i < currentIndex; i++) {
    trackList.push(formatTrack(playlist.tracks[i], i));
  }

  // Add current track
  trackList.push(formatTrack(playlist.tracks[currentIndex], currentIndex, true));

  // Add tracks after current track
  for (let i = currentIndex + 1; i < endAfter; i++) {
    trackList.push(formatTrack(playlist.tracks[i], i));
  }

  // Add ellipsis and last tracks if needed
  if (showEndTracks) {
    trackList.push("...");
    for (let i = totalTracks - 3; i < totalTracks; i++) {
      trackList.push(formatTrack(playlist.tracks[i], i));
    }
  }

  const embed = new EmbedBuilder()
    .setTitle(`Current Playlist`)
    .setDescription(trackList.join("\n"))
    .setColor("#1DB954")
    .setFooter({ text: `Playing track ${currentIndex + 1} of ${totalTracks} (${formatDuration(totalDurationMs)} total) in 🔊 ${playlist.voiceChannelName}` });

  await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
