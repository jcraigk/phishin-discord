import { describe, it, expect, vi, beforeEach } from "vitest";
import displayPlaylist from "../../commands/playlist.js";
import { EmbedBuilder, MessageFlags } from "discord.js";
import { formatDate, formatDuration } from "../../utils/timeUtils.js";

// Mock discord.js
vi.mock("discord.js", () => ({
  MessageFlags: {
    Ephemeral: 64
  },
  EmbedBuilder: vi.fn().mockImplementation(() => ({
    setTitle: vi.fn().mockReturnThis(),
    setDescription: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    setFooter: vi.fn().mockReturnThis()
  }))
}));

// Mock timeUtils
vi.mock("../../utils/timeUtils.js", () => ({
  formatDate: vi.fn(date => date),
  formatDuration: vi.fn((ms, format) => "3:45")
}));

describe("playlist command", () => {
  let mockInteraction;
  let mockClient;
  let mockPlaylist;

  const mockTracks = [
    {
      title: "Tweezer",
      slug: "tweezer",
      show_date: "2023-12-31",
      duration: 180000 // 3 minutes
    },
    {
      title: "Run Like an Antelope",
      slug: "run-like-an-antelope",
      show_date: "2023-12-31",
      duration: 180000
    },
    {
      title: "You Enjoy Myself",
      slug: "you-enjoy-myself",
      show_date: "2023-12-31",
      duration: 180000
    },
    {
      title: "Encore",
      slug: "encore",
      show_date: "2023-12-31",
      duration: 180000
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock the interaction
    mockInteraction = {
      guild: {
        id: "123456789"
      },
      reply: vi.fn(),
      deferReply: vi.fn(),
      followUp: vi.fn()
    };

    // Mock the playlist
    mockPlaylist = {
      tracks: [...mockTracks],
      currentIndex: 1,
      voiceChannelName: "General"
    };

    // Mock the client
    mockClient = {
      playlists: new Map([
        ["123456789", mockPlaylist]
      ])
    };

    // Reset formatDate and formatDuration mocks
    formatDate.mockReset();
    formatDuration.mockReset();
  });

  it("handles empty playlist", async () => {
    // Arrange
    mockClient.playlists.get("123456789").tracks = [];

    // Act
    await displayPlaylist(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "The playlist is currently empty",
      flags: MessageFlags.Ephemeral
    });
  });

  it("displays playlist with current track highlighted", async () => {
    // Act
    await displayPlaylist(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: MessageFlags.Ephemeral });
    expect(mockInteraction.followUp).toHaveBeenCalledWith({
      embeds: [expect.any(Object)],
      flags: MessageFlags.Ephemeral
    });
    expect(EmbedBuilder).toHaveBeenCalled();
  });

  it("formats tracks correctly", async () => {
    // Act
    await displayPlaylist(mockInteraction, mockClient);

    // Assert
    const embedCall = mockInteraction.followUp.mock.calls[0][0];
    const embed = embedCall.embeds[0];
    expect(embed.setDescription).toHaveBeenCalledWith(expect.stringContaining("Run Like an Antelope"));
    expect(embed.setDescription).toHaveBeenCalledWith(expect.stringContaining("2023-12-31"));
    expect(embed.setDescription).toHaveBeenCalledWith(expect.stringContaining("(3:45)"));
  });

  it("displays correct range of tracks around current track", async () => {
    // Arrange
    mockPlaylist.currentIndex = 1; // Second track
    mockPlaylist.tracks = Array(20).fill().map((_, i) => ({
      title: `Track ${i + 1}`,
      slug: `track-${i + 1}`,
      show_date: "2023-12-31",
      duration: 180000
    }));

    // Act
    await displayPlaylist(mockInteraction, mockClient);

    // Assert
    const embedCall = mockInteraction.followUp.mock.calls[0][0];
    const embed = embedCall.embeds[0];
    const description = embed.setDescription.mock.calls[0][0];

    // Should show ellipsis at start and end
    expect(description).toContain("...");
    // Should show current track (Track 2) highlighted
    expect(description).toContain("**[Track 2]");
    // Should show some tracks before and after
    expect(description).toContain("Track 1");
    expect(description).toContain("Track 3");
  });

  it("displays footer with correct information", async () => {
    // Act
    await displayPlaylist(mockInteraction, mockClient);

    // Assert
    const embedCall = mockInteraction.followUp.mock.calls[0][0];
    const embed = embedCall.embeds[0];
    expect(embed.setFooter).toHaveBeenCalledWith({
      text: expect.stringContaining("Playing track 2 of 4")
    });
    expect(embed.setFooter).toHaveBeenCalledWith({
      text: expect.stringContaining("3:45 total")
    });
    expect(embed.setFooter).toHaveBeenCalledWith({
      text: expect.stringContaining("🔊 General")
    });
  });

  it("sets the correct embed color", async () => {
    // Act
    await displayPlaylist(mockInteraction, mockClient);

    // Assert
    const embedCall = mockInteraction.followUp.mock.calls[0][0];
    const embed = embedCall.embeds[0];
    expect(embed.setColor).toHaveBeenCalledWith("#2f3335");
  });
});
