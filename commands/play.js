import { EmbedBuilder, MessageFlags } from "discord.js";
import { AudioPlayerStatus, createAudioResource } from "@discordjs/voice";
import { fetchRandomShow, fetchTracksByQuery } from "../services/phishinAPI.js";
import { getOrCreatePlaylist } from "../utils/playlistUtils.js";
import { createNowPlayingEmbed } from "../utils/embedUtils.js";

export default async function handlePlay(interaction, client) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const query = interaction.options.getString("query");
  const voiceChannel = interaction.member.voice.channel;

  if (!voiceChannel) {
    await interaction.editReply("🔊 You need to be in a voice channel to play audio");
    return;
  }

  const playlist = getOrCreatePlaylist(client, interaction.guild.id, voiceChannel);

  // Check if the bot is already actively playing
  if (playlist.isActive && !playlist.isPaused) {
    const track = playlist.tracks[playlist.currentIndex];
    const embed = createNowPlayingEmbed(track, playlist, "Now Playing");
    await interaction.editReply({
      content: "Already playing. Use `/phishin stop` to reset the playlist.",
      embeds: [embed],
    });
  } else if (playlist.isPaused) { // If paused, resume
    await handleResumePlayback(interaction, client);
  } else { // Otherwise, handle the new query
    await handleQuery(interaction, client, query);
  }
}

async function handleQuery(interaction, client, query) {
  let tracks = [];
  if (!query || query.toLowerCase() === "random") {
    const showData = await fetchRandomShow();
    tracks = showData.tracks;
  } else {
    tracks = await fetchTracksByQuery(query);
  }

  const playlist = client.playlists.get(interaction.guild.id);

  // Clear the playlist before adding new tracks
  playlist.tracks = [];
  playlist.currentIndex = 0;

  // Add the new tracks
  playlist.tracks.push(...tracks);

  await playNextTrack(interaction, client);
}

async function handleResumePlayback(interaction, client) {
  const playlist = client.playlists.get(interaction.guild.id);

  playlist.player.unpause();
  playlist.isActive = true;
  playlist.isPaused = false;

  const track = playlist.tracks[playlist.currentIndex];
  const embed = createNowPlayingEmbed(track, playlist, "Playback resumed");
  await interaction.editReply({ embeds: [embed] });
}

async function playNextTrack(interaction, client) {
  const playlist = client.playlists.get(interaction.guild.id);

  if (!playlist || playlist.currentIndex >= playlist.tracks.length) {
    await interaction.editReply("Finished playing all tracks");
    playlist.connection.destroy();
    client.playlists.delete(interaction.guild.id);
    return;
  }

  const track = playlist.tracks[playlist.currentIndex];
  const trackUrl = track.mp3_url;

  if (!trackUrl) {
    playlist.currentIndex++;
    await playNextTrack(interaction, client);
    return;
  }

  const resource = createAudioResource(trackUrl);
  playlist.player.play(resource);

  playlist.player.once(AudioPlayerStatus.Idle, () => {
    playlist.currentIndex++;
    playNextTrack(interaction, client);
  });

  playlist.isActive = true;

  const embed = createNowPlayingEmbed(track, playlist, "Now Playing");
  await interaction.editReply({ embeds: [embed] });
}
