import { MessageFlags } from "discord.js";

export default async function handlePause(interaction, client) {
  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.player) {
    await interaction.reply({
      content: "Playback is currently stopped",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  playlist.player.pause();
  playlist.isPaused = true;
  client.playlists.set(interaction.guild.id, playlist);
  await interaction.reply({
    content: "Playback paused. Use `/phishin play` to resume.",
    flags: MessageFlags.Ephemeral
  });
}
