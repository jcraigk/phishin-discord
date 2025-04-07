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
    playlist.player.stop();
    playlist.connection.destroy();
    client.playlists.delete(interaction.guild.id);
    await interaction.reply({
      content: "⏹️ Playback stopped and playlist cleared",
      flags: MessageFlags.Ephemeral
    });
  } catch (error) {
    console.error("Error stopping playback:", error);
    await interaction.reply({
      content: "❌ An error occurred while trying to stop playback",
      flags: MessageFlags.Ephemeral
    });
  }
}
