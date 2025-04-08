import { describe, it, expect, vi, beforeEach } from "vitest";
import handleRemove from "../../commands/remove.js";
import { EmbedBuilder, MessageFlags } from "discord.js";
import { formatDate } from "../../utils/timeUtils.js";

// Mock discord.js
vi.mock("discord.js", () => ({
  MessageFlags: {
    Ephemeral: 64
  },
  EmbedBuilder: vi.fn().mockImplementation(() => ({
    setTitle: vi.fn().mockReturnThis(),
    setDescription: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis()
  }))
}));

// Mock timeUtils
vi.mock("../../utils/timeUtils.js", () => ({
  formatDate: vi.fn(date => date)
}));

describe("remove command", () => {
  let mockInteraction;
  let mockClient;
  let mockPlaylist;

  const mockTracks = [
    {
      title: "Tweezer",
      slug: "tweezer",
      show_date: "2023-12-31",
      duration: 180000
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
      options: {
        getInteger: vi.fn()
      },
      reply: vi.fn()
    };

    // Mock the playlist
    mockPlaylist = {
      tracks: [...mockTracks],
      currentIndex: 1 // Second track is current
    };

    // Mock the client
    mockClient = {
      playlists: new Map([
        ["123456789", mockPlaylist]
      ])
    };

    // Reset formatDate mock
    formatDate.mockReset();
  });

  it("removes a track from the playlist", async () => {
    // Arrange
    mockInteraction.options.getInteger.mockReturnValue(3); // Remove third track
    const originalLength = mockPlaylist.tracks.length;

    // Act
    await handleRemove(mockInteraction, mockClient);

    // Assert
    // Check that the track was removed
    expect(mockPlaylist.tracks.length).toBe(originalLength - 1);
    // Check that the correct track was removed
    expect(mockPlaylist.tracks).not.toContainEqual(mockTracks[2]);
    // Check that the playlist was updated in the client
    expect(mockClient.playlists.get("123456789")).toBe(mockPlaylist);
    // Check that the interaction was replied to with an embed
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      embeds: [expect.any(Object)],
      flags: MessageFlags.Ephemeral
    });
    // Check that the embed was created with the correct title
    expect(EmbedBuilder).toHaveBeenCalled();
  });

  it("handles invalid track number", async () => {
    // Arrange
    mockInteraction.options.getInteger.mockReturnValue(5); // Invalid track number

    // Act
    await handleRemove(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "❌ Invalid track number",
      flags: MessageFlags.Ephemeral
    });
  });

  it("handles empty playlist", async () => {
    // Arrange
    mockPlaylist.tracks = [];
    mockClient.playlists.set("123456789", mockPlaylist);
    mockInteraction.options.getInteger.mockReturnValue(1); // Set a valid track number

    // Act
    await handleRemove(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "❌ The playlist is currently empty",
      flags: MessageFlags.Ephemeral
    });
  });
});
