import { MessageFlags } from "discord.js";
import { createAudioResource } from "@discordjs/voice";
import { createNowPlayingEmbed } from "../utils/embedUtils.js";

export default async function handlePreviousTrack(interaction, client) {
  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.player || playlist.currentIndex <= 0) {
    await interaction.reply({
      content: "❌ There's no previous track to skip to",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    playlist.currentIndex--;

    if (playlist.currentIndex >= 0) {
      const track = playlist.tracks[playlist.currentIndex];
      const trackUrl = track.mp3_url;

      if (trackUrl) {
        const resource = createAudioResource(trackUrl);
        playlist.player.play(resource);

        const embed = createNowPlayingEmbed(track, playlist, "Playing Previous Track");
        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral
        });
      } else {
        await handlePreviousTrack(interaction, client);
      }
    } else {
      await interaction.reply({
        content: "❌ You've reached the beginning of the playlist",
        flags: MessageFlags.Ephemeral
      });
    }
  } catch (error) {
    // console.error("Error skipping to previous track:", error);
    await interaction.reply({
      content: "❌ Unable to play previous track",
      flags: MessageFlags.Ephemeral
    });
  }
}
