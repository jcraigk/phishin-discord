import { EmbedBuilder, MessageFlags } from "discord.js";
import { createAudioResource } from "@discordjs/voice";
import { formatDate } from "../utils/timeUtils.js";

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
      const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;
      const showLink = `https://phish.in/${track.show_date}`;

      if (trackUrl) {
        const resource = createAudioResource(trackUrl);
        playlist.player.play(resource);

        const embed = new EmbedBuilder()
          .setTitle("Previous Track")
          .setDescription(`Now playing: [${track.title}](https://phish.in/${track.show_date}/${track.slug})`)
          .setColor("#2f3335")
          .setFooter({ text: `Track ${playlist.currentIndex + 1} of ${playlist.tracks.length} in 🔊 ${playlist.voiceChannelName}` });

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
