import { MessageFlags } from "discord.js";

export default async function handleStop(interaction, client) {
  const currentShow = client.shows?.get(interaction.guild.id);

  if (!currentShow || !currentShow.player) {
    await interaction.reply({
      content: "There's nothing currently playing to stop.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    currentShow.player.stop();
    currentShow.connection.destroy();
    client.shows.delete(interaction.guild.id);

    await interaction.reply("Playback stopped and playlist cleared.");
  } catch (error) {
    console.error("Error stopping playback:", error);
    await interaction.reply("An error occurred while trying to stop playback.");
  }
}
