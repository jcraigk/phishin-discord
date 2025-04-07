import { MessageFlags } from "discord.js";
import { formatDate } from "../utils/timeUtils.js";

export default async function handleRemove(interaction, client) {
  const trackNumber = interaction.options.getInteger("track_number");

  if (trackNumber === null || isNaN(trackNumber)) {
    await interaction.reply({
      content: "❌ You must provide a valid track number to remove",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
    await interaction.reply({
      content: "❌ The playlist is currently empty",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const index = trackNumber - 1; // Convert 1-based index to 0-based

  if (index < 0 || index >= playlist.tracks.length) {
    await interaction.reply({
      content: "❌ Invalid track number",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const removedTrack = playlist.tracks.splice(index, 1)[0];
  client.playlists.set(interaction.guild.id, playlist);

  await interaction.reply({
    content: `🗑️ Removed track: ${removedTrack.title} - ${formatDate(removedTrack.show_date)}`,
    flags: MessageFlags.Ephemeral
  });
}
