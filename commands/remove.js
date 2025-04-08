import { EmbedBuilder, MessageFlags } from "discord.js";
import { formatDate } from "../utils/timeUtils.js";

export default async function handleRemove(interaction, client) {
  const trackNumber = interaction.options.getInteger("track_number");

  if (trackNumber === null || isNaN(trackNumber)) {
    await interaction.reply({
      content: "❌ You must provide a valid track number to remove",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const playlist = client.playlists?.get(interaction.guild.id);

  if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
    await interaction.reply({
      content: "❌ The playlist is currently empty",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const index = trackNumber - 1;

  if (index < 0 || index >= playlist.tracks.length) {
    await interaction.reply({
      content: "❌ Invalid track number",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  if (index === playlist.currentIndex) {
    await interaction.reply({
      content: `❌ You can't remove the current track: **${playlist.tracks[index].title}**.`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const removedTrack = playlist.tracks.splice(index, 1)[0];

  // Adjust currentIndex if necessary
  if (index < playlist.currentIndex) {
    playlist.currentIndex--;
  }

  client.playlists.set(interaction.guild.id, playlist);

  const trackLink = `https://phish.in/${removedTrack.show_date}/${removedTrack.slug}`;
  const showLink = `https://phish.in/${removedTrack.show_date}`;

  const embed = new EmbedBuilder()
    .setTitle("Track Removed")
    .setDescription(`Removed [${removedTrack.title}](https://phish.in/${removedTrack.show_date}/${removedTrack.slug}) from the playlist`)
    .setColor("#2f3335");

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral
  });
}
