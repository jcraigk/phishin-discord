import { MessageFlags } from "discord.js";

export default async function handleStop(interaction, client) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.player) {
    await interaction.editReply({
      content: "Player already stopped"
    });
    return;
  }

  playlist.player.stop();
  playlist.connection.destroy();
  client.playlists.delete(interaction.guild.id);

  await interaction.editReply({
    content: "Playback stopped and playlist cleared"
  });
}
