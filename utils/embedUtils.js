import { EmbedBuilder } from "discord.js";
import { formatDate } from "./timeUtils.js";

/**
 * Creates a standardized "Now Playing" embed for track information
 * @param {Object} track - The track object containing show and track information
 * @param {Object} playlist - The playlist object containing current track index and total tracks
 * @param {string} title - The title to display at the top of the embed (e.g., "Now Playing", "Playback resumed")
 * @returns {EmbedBuilder} - A formatted Discord embed
 */
export function createNowPlayingEmbed(track, playlist, title) {
  const trackLink = `https://phish.in/${track.show_date}/${track.slug}`;
  const showLink = `https://phish.in/${track.show_date}`;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(`**[${track.title}](${trackLink}) - [${formatDate(track.show_date)}](${showLink})**\n${track.venue_name || 'Unknown'}, ${track.venue_location || 'Unknown'}`)
    .setColor("#2f3335")
    .setThumbnail(track.show_cover_art_urls?.medium || null)
    .setFooter({ text: `Track ${playlist.currentIndex + 1} of ${playlist.tracks.length} in 🔊 ${playlist.voiceChannelName}` });

  return embed;
}
