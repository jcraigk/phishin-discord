import { MessageFlags } from "discord.js";

export default async function handleStop(interaction, client) {
  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.player) {
    await interaction.reply({
      content: "⏹️ Player already stopped",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    // Stop the audio player
    playlist.player.stop();

    // Destroy the connection
    playlist.connection.destroy();

    // Clear the playlist and any stored data
    client.playlists.delete(interaction.guild.id);

    await interaction.reply("⏹️ Playback stopped and playlist cleared");
  } catch (error) {
    console.error("Error stopping playback:", error);
    await interaction.reply("❌ An error occurred while trying to stop playback");
  }
}
