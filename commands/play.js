import { MessageFlags } from "discord.js";
import { AudioPlayerStatus, createAudioResource } from "@discordjs/voice";
import { fetchRandomShow, fetchTracksByQuery } from "../services/phishinAPI.js";
import { formatDate } from "../utils/timeUtils.js";
import { getOrCreatePlaylist } from "../utils/playlistUtils.js";

export default async function handlePlay(interaction, client) {
  const query = interaction.options.getString("query");
  const voiceChannel = interaction.member.voice.channel;

  if (!voiceChannel) {
    await interaction.reply({
      content: "❌ You need to be in a voice channel to play music",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await interaction.deferReply();

  const playlist = getOrCreatePlaylist(client, interaction.guild.id, voiceChannel);

  if (playlist.isPaused) {
    await handleResumePlayback(interaction, client);
  } else {
    await handleQuery(interaction, client, query);
  }
}

async function handleQuery(interaction, client, query) {
  try {
    let tracks = [];

    if (!query || query.toLowerCase() === "random") {
      const showData = await fetchRandomShow();
      tracks = showData.tracks;
    } else {
      tracks = await fetchTracksByQuery(query);
    }

    const playlist = client.playlists.get(interaction.guild.id);
    playlist.tracks.push(...tracks);

    await playNextTrack(interaction, client);
  } catch (error) {
    console.error("Error fetching or playing audio:", error);
    await interaction.editReply("❌ Network error - could not fetch data");
  }
}

async function handleResumePlayback(interaction, client) {
  const playlist = client.playlists.get(interaction.guild.id);

  try {
    playlist.player.unpause();
    playlist.isPaused = false;

    const track = playlist.tracks[playlist.currentIndex];
    const trackDisplay = `${track.title} - ${formatDate(track.show_date)}`;

    await interaction.editReply(`▶️ Playback resumed: ${trackDisplay}`);
  } catch (error) {
    console.error("Error resuming playback:", error);
    await interaction.editReply("❌ An error occurred while trying to resume playback.");
  }
}

async function playNextTrack(interaction, client) {
  const playlist = client.playlists.get(interaction.guild.id);

  if (!playlist || playlist.currentIndex >= playlist.tracks.length) {
    await interaction.editReply("⏹️ Finished playing all tracks");
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

  const trackDisplay = `${track.title} - ${formatDate(track.show_date)}`;
  await interaction.editReply(`Now playing in 🔊 **${playlist.voiceChannelName}**: ${trackDisplay}`);
}
