import { EmbedBuilder, MessageFlags } from "discord.js";
import { AudioPlayerStatus } from "@discordjs/voice";
import { formatDate, formatDuration } from "../utils/timeUtils.js";

const MAX_TRACKS_PER_PAGE = 25;

export default async function displayPlaylist(interaction, client) {
  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
    await interaction.reply({
      content: "The playlist is currently empty",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true }); // ✅ Acknowledge the interaction before processing

  const totalDurationMs = playlist.tracks.reduce((sum, track) => sum + track.duration, 0);
  const totalPages = Math.ceil(playlist.tracks.length / MAX_TRACKS_PER_PAGE);

  for (let page = 0; page < totalPages; page++) {
    const start = page * MAX_TRACKS_PER_PAGE;
    const end = start + MAX_TRACKS_PER_PAGE;
    const tracks = playlist.tracks.slice(start, end);

    const trackList = tracks.map((track, index) => {
      const trackIndex = start + index + 1;
      const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;
      const trackInfo = `${trackIndex}. [${track.title} - ${formatDate(track.show_date)}](${trackLink}) (${formatDuration(track.duration, "colons")})`;
      return (start + index) === playlist.currentIndex && playlist.isActive
  ? `${trackInfo} [NOW PLAYING]`
  : trackInfo;

    }).join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`Current Playlist in 🔊 ${playlist.voiceChannelName} (${formatDuration(totalDurationMs)}):`)
      .setDescription(trackList)
      .setColor("#1DB954")
      .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

    await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral }); // Respond with the embed
  }
}
