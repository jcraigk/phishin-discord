import { MessageFlags } from "discord.js";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import { fetchRandomShow } from "../services/phishinAPI.js";
import { formatDate } from "../utils/dateUtils.js";

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

  const currentShow = client.shows?.get(interaction.guild.id);

  if (currentShow && currentShow.isPaused) {
    // If there is a paused show, resume playback
    await handleResumePlayback(interaction, client);
  } else if (!query || query.toLowerCase() === "random") {
    // If there's no paused show, start a random show
    await handleRandomShow(interaction, client, voiceChannel);
  } else {
    await interaction.editReply("❌ Only 'random' or empty queries are supported right now.");
  }
}

async function handleRandomShow(interaction, client, voiceChannel) {
  try {
    const showData = await fetchRandomShow();
    const tracks = showData.tracks;

    if (!tracks || tracks.length === 0) {
      await interaction.editReply("❌ No tracks found for this show.");
      return;
    }

    const formattedDate = formatDate(showData.date);
    const showLink = `https://phish.in/${showData.date}`;

    // Send the random show selected message
    await interaction.editReply({
      content: `🎲 Random show selected: [${formattedDate}](${showLink})`,
      flags: MessageFlags.Ephemeral
    });

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();

    connection.subscribe(player);

    const playlist = [...tracks];
    client.shows = client.shows || new Map();
    client.shows.set(interaction.guild.id, { playlist, player, connection, currentIndex: 0, formattedDate, isPaused: false });

    await playNextTrack(interaction, client);
  } catch (error) {
    console.error("Error fetching or playing show:", error);
    await interaction.editReply("❌ Network error - could not fetch data.");
  }
}

async function handleResumePlayback(interaction, client) {
  const currentShow = client.shows.get(interaction.guild.id);

  if (!currentShow || !currentShow.player) {
    await interaction.reply({
      content: "❌ There's no show to resume.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    currentShow.player.unpause();
    currentShow.isPaused = false;

    // Fetch the current track's information
    const track = currentShow.playlist[currentShow.currentIndex];
    const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;
    const trackDisplay = `${track.title} - ${currentShow.formattedDate} - \`${trackLink}\``;

    client.shows.set(interaction.guild.id, currentShow);  // Update state

    await interaction.editReply(`▶️ Playback resumed: ${trackDisplay}`);
  } catch (error) {
    console.error("Error resuming playback:", error);
    await interaction.editReply("❌ An error occurred while trying to resume playback.");
  }
}

async function playNextTrack(interaction, client) {
  const currentShow = client.shows.get(interaction.guild.id);

  if (!currentShow || currentShow.currentIndex >= currentShow.playlist.length) {
    await interaction.editReply("Finished playing all tracks.");
    currentShow.connection.destroy();
    client.shows.delete(interaction.guild.id);
    return;
  }

  const track = currentShow.playlist[currentShow.currentIndex];
  const trackUrl = track.mp3_url;
  const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;

  if (!trackUrl) {
    currentShow.currentIndex++;
    await playNextTrack(interaction, client);
    return;
  }

  const resource = createAudioResource(trackUrl);
  currentShow.player.play(resource);

  currentShow.player.once(AudioPlayerStatus.Idle, () => {
    currentShow.currentIndex++;
    playNextTrack(interaction, client);
  });

  const formattedDate = currentShow.formattedDate;
  const trackDisplay = `${track.title} - ${formattedDate} - \`${trackLink}\``;

  await interaction.editReply(`▶️ Now playing: ${trackDisplay}`);
}
