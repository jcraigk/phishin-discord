import { MessageFlags } from "discord.js";
import { createAudioResource } from "@discordjs/voice";
import { createNowPlayingEmbed } from "../utils/embedUtils.js";

export default async function handleNextTrack(interaction, client) {
  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.player || playlist.currentIndex >= playlist.tracks.length) {
    await interaction.reply({
      content: "❌ There's nothing currently playing or no more tracks to skip",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    playlist.currentIndex++;

    if (playlist.currentIndex < playlist.tracks.length) {
      const track = playlist.tracks[playlist.currentIndex];
      const trackUrl = track.mp3_url;

      if (trackUrl) {
        const resource = createAudioResource(trackUrl);
        playlist.player.play(resource);

        const embed = createNowPlayingEmbed(track, playlist, "Playing Next Track");
        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral
        });
      } else {
        await handleNextTrack(interaction, client);
      }
    } else {
      await interaction.reply({
        content: "❌ You've reached the end of the playlist",
        flags: MessageFlags.Ephemeral
      });
    }
  } catch (error) {
    // console.error("Error skipping track:", error);
    await interaction.reply({
      content: "❌ Track skip failed",
      flags: MessageFlags.Ephemeral
    });
  }
}
