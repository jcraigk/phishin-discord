import { EmbedBuilder } from "discord.js";
import { formatDate } from "./timeUtils.js";

export function createNowPlayingEmbed(track, playlist, title) {
  const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;
  const showLink = `https://phish.in/${track.show_date}`;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(`**[${track.title}](${trackLink}) - [${formatDate(track.show_date)}](${showLink})**\n${track.venue_name || 'Unknown Venue'}, ${track.venue_location || 'Unknown Location'}`)
    .setColor("#2f3335")
    .setThumbnail(track.show_cover_art_urls?.medium || null)
    .setFooter({ text: `Track ${playlist.currentIndex + 1} of ${playlist.tracks.length} in 🔊 ${playlist.voiceChannelName}` });

  return embed;
}
