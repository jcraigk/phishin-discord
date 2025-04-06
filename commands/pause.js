import { MessageFlags } from "discord.js";

export default async function handlePause(interaction, client) {
  const currentShow = client.shows?.get(interaction.guild.id);

  if (!currentShow || !currentShow.player) {
    await interaction.reply({
      content: "There's nothing currently playing to pause.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    currentShow.player.pause();
    currentShow.isPaused = true;
    client.shows.set(interaction.guild.id, currentShow);

    await interaction.reply("Playback paused. Use `/phishin play` to resume.");
  } catch (error) {
    console.error("Error pausing playback:", error);
    await interaction.reply("An error occurred while trying to pause playback.");
  }
}
