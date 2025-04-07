import { MessageFlags } from "discord.js";
import { fetchTracksByQuery } from "../services/phishinAPI.js";
import { formatDate, formatDuration } from "../utils/timeUtils.js";

export default async function handlePlaylist(interaction, client) {
  const action = interaction.options.getString("action");
  const query = interaction.options.getString("query");

  switch (action) {
    case "info":
      await displayPlaylist(interaction, client);
      return;
    case "add":
      if (!query) {
        await interaction.reply({
          content: "❌ You must provide a query to add tracks",
          flags: MessageFlags.Ephemeral
        });
        return;
      }
      await handleAdd(interaction, client, query);
      break;
    case "remove":
      if (!query) {
        await interaction.reply({
          content: "❌ You must provide a track number to remove",
          flags: MessageFlags.Ephemeral
        });
        return;
      }
      await handleRemove(interaction, client, query);
      break;
  }
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
    .map((track, index) =>
      `${index + 1}. ${track.title} - ${formatDate(track.show_date)} (${formatDuration(track.duration, "colons")})`
    )
    .join("\n");

  const totalDurationMs = playlist.tracks.reduce((sum, track) => sum + track.duration, 0);

  await interaction.reply({
    content: `**Current Playlist (${formatDuration(totalDurationMs)}):**\n${trackList}`,
    flags: MessageFlags.Ephemeral
  });
}

async function handleAdd(interaction, client, query) {
  try {
    const tracks = await fetchTracksByQuery(query);

    if (!tracks || tracks.length === 0) {
      await interaction.reply({
        content: "❌ No tracks found matching your query.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    let playlist = client.playlists?.get(interaction.guild.id) || [];
    playlist = playlist.concat(tracks);
    client.playlists.set(interaction.guild.id, playlist);

    await interaction.reply({
      content: `➕ Added ${tracks.length} track(s) to the playlist`,
      flags: MessageFlags.Ephemeral
    });
  } catch (error) {
    console.error("Error adding tracks to playlist:", error);
    await interaction.reply({
      content: "❌ An error occurred while adding tracks to the playlist",
      flags: MessageFlags.Ephemeral
    });
  }
}

async function handleRemove(interaction, client, trackNumber) {
  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || playlist.length === 0) {
    await interaction.reply({
      content: "❌ The playlist is currently empty",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const index = parseInt(trackNumber, 10) - 1;

  if (isNaN(index) || index < 0 || index >= playlist.length) {
    await interaction.reply({
      content: "❌ Invalid track number",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const removedTrack = playlist.splice(index, 1)[0];
  client.playlists.set(interaction.guild.id, playlist);

  await interaction.reply({
    content: `🗑️ Removed track: ${removedTrack.title} - ${formatDate(removedTrack.show_date)}`,
    flags: MessageFlags.Ephemeral
  });
}

