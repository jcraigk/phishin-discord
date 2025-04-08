import { describe, it, expect, vi } from "vitest";
import { EmbedBuilder } from "discord.js";
import { createNowPlayingEmbed } from "../../utils/embedUtils.js";

// Mock data for testing
const mockTrack = {
  title: "Tweezer",
  show_date: "1995-12-31",
  slug: "tweezer",
  venue_name: "Madison Square Garden",
  venue_location: "New York, NY",
  show_cover_art_urls: {
    medium: "https://example.com/album-art.jpg"
  }
};

const mockPlaylist = {
  currentIndex: 0,
  tracks: [mockTrack, mockTrack, mockTrack],
  voiceChannelName: "Music Channel"
};

describe("embedUtils", () => {
  describe("createNowPlayingEmbed", () => {
    it("should create an embed with the correct title", () => {
      const title = "Now Playing";
      const embed = createNowPlayingEmbed(mockTrack, mockPlaylist, title);

      expect(embed).toBeInstanceOf(EmbedBuilder);
      expect(embed.data.title).toBe(title);
    });

    it("should include the track title and date in the description", () => {
      const embed = createNowPlayingEmbed(mockTrack, mockPlaylist, "Now Playing");

      expect(embed.data.description).toContain(mockTrack.title);
      expect(embed.data.description).toContain("Dec 31, 1995");
    });

    it("should include the venue and location in the description", () => {
      const embed = createNowPlayingEmbed(mockTrack, mockPlaylist, "Now Playing");

      expect(embed.data.description).toContain(mockTrack.venue_name);
      expect(embed.data.description).toContain(mockTrack.venue_location);
    });

    it("should set the thumbnail to the album art URL", () => {
      const embed = createNowPlayingEmbed(mockTrack, mockPlaylist, "Now Playing");

      expect(embed.data.thumbnail.url).toBe(mockTrack.show_cover_art_urls.medium);
    });

    it("should include the track count and voice channel in the footer", () => {
      const embed = createNowPlayingEmbed(mockTrack, mockPlaylist, "Now Playing");

      expect(embed.data.footer.text).toContain("Track 1 of 3");
      expect(embed.data.footer.text).toContain(mockPlaylist.voiceChannelName);
    });

    it("should handle missing venue information gracefully", () => {
      const trackWithoutVenue = {
        ...mockTrack,
        venue_name: null,
        venue_location: null
      };
      const embed = createNowPlayingEmbed(trackWithoutVenue, mockPlaylist, "Now Playing");

      expect(embed.data.description).toContain("Unknown Venue, Unknown Location");
    });

    it("should create correct links to phish.in", () => {
      const embed = createNowPlayingEmbed(mockTrack, mockPlaylist, "Now Playing");

      expect(embed.data.description).toContain(`https://phish.in/${mockTrack.show_date}/${mockTrack.slug}`);
      expect(embed.data.description).toContain(`https://phish.in/${mockTrack.show_date}`);
    });
  });
});
