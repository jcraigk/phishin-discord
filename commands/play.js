import { MessageFlags } from "discord.js";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import { fetchRandomShow, fetchTracksByQuery } from "../services/phishinAPI.js";
import { formatDate } from "../utils/timeUtils.js";

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

  const playlist = client.playlists?.get(interaction.guild.id);

  if (playlist?.isPaused) {
    await handleResumePlayback(interaction, client);
  } else {
    await handleQuery(interaction, client, voiceChannel, query);
  }
}

async function handleQuery(interaction, client, voiceChannel, query) {
  try {
    let showData;
    let tracks = [];

    if (!query || query.toLowerCase() === "random") {
      showData = await fetchRandomShow();
      tracks = showData.tracks;
    } else {
      tracks = await fetchTracksByQuery(query);
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    client.playlists = client.playlists || new Map();
    client.playlists.set(interaction.guild.id, { tracks: tracks, player, connection, currentIndex: 0, isPaused: false });

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

    client.playlists.set(interaction.guild.id, playlist);

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
  const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;

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

  const formattedDate = playlist.formattedDate;
  const trackDisplay = `${track.title} - ${formatDate(track.show_date)}`;

  await interaction.editReply(`▶️ Now playing: ${trackDisplay}`);
}
