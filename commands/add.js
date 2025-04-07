import { MessageFlags } from "discord.js";
import { fetchTracksByQuery } from "../services/phishinAPI.js";
import { getOrCreatePlaylist } from "../utils/playlistUtils.js";

export default async function handleAdd(interaction, client) {
  const query = interaction.options.getString("query");

  if (!query) {
    await interaction.reply({
      content: "❌ You must provide a query to add tracks",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    const tracks = await fetchTracksByQuery(query);

    if (!tracks || tracks.length === 0) {
      await interaction.reply({
        content: "❌ No tracks found matching your query",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const playlist = getOrCreatePlaylist(client, interaction.guild.id);
    playlist.tracks.push(...tracks);

    await interaction.reply({
      content: `➕ Added ${tracks.length} track${tracks.length === 1 ? "" : "s"} to the playlist`,
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
