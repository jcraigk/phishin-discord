import { MessageFlags } from "discord.js";
import { fetchTracksByQuery } from "../services/phishinAPI.js";
import { getOrCreatePlaylist } from "../utils/playlistUtils.js";

export default async function handleAdd(interaction, client) {
  const query = interaction.options.getString("query");

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const tracks = await fetchTracksByQuery(query);

    if (!tracks || tracks.length === 0) {
      await interaction.editReply("❌ No tracks found matching your query");
      return;
    }

    const playlist = getOrCreatePlaylist(client, interaction.guild.id);
    playlist.tracks.push(...tracks);

    await interaction.editReply(`➕ Added ${tracks.length} track${tracks.length === 1 ? "" : "s"} to the playlist`);
  } catch (error) {
    console.error("Error adding tracks to playlist:", error);
    await interaction.editReply("❌ An error occurred while adding tracks to the playlist");
  }
}
