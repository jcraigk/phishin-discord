import { MessageFlags } from "discord.js";

export default async function handlePause(interaction, client) {
  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.player) {
    await interaction.reply({
      content: "⏹️ Playback is currently stopped",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    // Pause the audio player
    playlist.player.pause();

    // Mark the playback as paused
    playlist.isPaused = true;

    // Update the stored state
    client.playlists.set(interaction.guild.id, playlist);

    await interaction.reply("⏸️ Playback paused. Use `/phishin play` to resume.");
  } catch (error) {
    console.error("Error pausing playback:", error);
    await interaction.reply("❌ An error occurred while trying to pause playback.");
  }
}
