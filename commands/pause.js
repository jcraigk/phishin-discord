import { MessageFlags } from "discord.js";

export default async function handlePause(interaction, client) {
  const currentShow = client.shows?.get(interaction.guild.id);

  if (!currentShow || !currentShow.player) {
    await interaction.reply({
      content: "⏹️ Playback is currently stopped",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    // Pause the audio player
    currentShow.player.pause();

    // Mark the playback as paused
    currentShow.isPaused = true;

    // Update the stored state
    client.shows.set(interaction.guild.id, currentShow);

    await interaction.reply("⏸️ Playback paused. Use `/phishin play` to resume.");
  } catch (error) {
    console.error("Error pausing playback:", error);
    await interaction.reply("❌ An error occurred while trying to pause playback.");
  }
}
