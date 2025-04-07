import { MessageFlags } from "discord.js";

export default async function handleStop(interaction, client) {
  const currentShow = client.shows?.get(interaction.guild.id);

  if (!currentShow || !currentShow.player) {
    await interaction.reply({
      content: "⏹️ Player already stopped",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    // Stop the audio player
    currentShow.player.stop();

    // Destroy the connection
    currentShow.connection.destroy();

    // Clear the playlist and any stored data
    client.shows.delete(interaction.guild.id);

    await interaction.reply("⏹️ Playback stopped and playlist cleared");
  } catch (error) {
    console.error("Error stopping playback:", error);
    await interaction.reply("❌ An error occurred while trying to stop playback");
  }
}
