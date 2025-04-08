import { EmbedBuilder, MessageFlags } from "discord.js";
import { AudioPlayerStatus, createAudioResource } from "@discordjs/voice";
import { fetchRandomShow, fetchTracksByQuery } from "../services/phishinAPI.js";
import { formatDate } from "../utils/timeUtils.js";
import { getOrCreatePlaylist } from "../utils/playlistUtils.js";

export default async function handlePlay(interaction, client) {
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const query = interaction.options.getString("query");
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      await interaction.editReply({
        content: "❌ You need to be in a voice channel to play audio"
      });
      return;
    }

    const playlist = getOrCreatePlaylist(client, interaction.guild.id, voiceChannel);

    if (playlist.isPaused) {
      await handleResumePlayback(interaction, client);
    } else {
      await handleQuery(interaction, client, query);
    }
  } catch (error) {
    // console.error("Error in handlePlay:", error);
    await interaction.editReply("❌ An error occurred while trying to play audio");
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

    // Clear the playlist before adding new tracks
    playlist.tracks = [];
    playlist.currentIndex = 0;

    // Add the new tracks
    playlist.tracks.push(...tracks);

    await playNextTrack(interaction, client);
  } catch (error) {
    // console.error("Error fetching or playing audio:", error);
    await interaction.editReply("❌ Network error - could not fetch data");
  }
}

async function handleResumePlayback(interaction, client) {
  const playlist = client.playlists.get(interaction.guild.id);
  try {
    playlist.player.unpause();
    playlist.isActive = true;
    playlist.isPaused = false;

    const track = playlist.tracks[playlist.currentIndex];
    const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;
    const showLink = `https://phish.in/${track.show_date}`;

    const embed = new EmbedBuilder()
      .setTitle(`Playback resumed`)
      .setDescription(`[${track.title}](${trackLink}) - [${formatDate(track.show_date)}](${showLink})`)
      .setColor("#2f3335")
      .setFooter({ text: `Track ${playlist.currentIndex + 1} of ${playlist.tracks.length} in 🔊 ${playlist.voiceChannelName}` });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    // console.error("Error resuming playback:", error);
    await interaction.editReply("❌ An error occurred while trying to resume playback.");
  }
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

  const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;
  const showLink = `https://phish.in/${track.show_date}`;

  const embed = new EmbedBuilder()
    .setTitle("Now Playing")
    .setDescription(`[${track.title}](${trackLink}) - [${formatDate(track.show_date)}](${showLink})`)
    .setColor("#2f3335")
    .setFooter({ text: `Track ${playlist.currentIndex + 1} of ${playlist.tracks.length} in 🔊 ${playlist.voiceChannelName}` });

  await interaction.editReply({ embeds: [embed] });
}
