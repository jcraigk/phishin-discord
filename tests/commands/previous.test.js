import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmbedBuilder, MessageFlags } from "discord.js";
import { createAudioResource } from "@discordjs/voice";

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

// Mock @discordjs/voice
vi.mock("@discordjs/voice", () => ({
  createAudioResource: vi.fn()
}));

// Mock embedUtils
vi.mock("../../utils/embedUtils.js", () => {
  return {
    createNowPlayingEmbed: vi.fn().mockReturnValue({
      data: {
        title: "Mock Embed",
        description: "Mock Description",
        color: "#2f3335",
        footer: { text: "Mock Footer" }
      }
    })
  };
});

// Import the handler after mocks are defined
import handlePreviousTrack from "../../commands/previous.js";

describe("previous command", () => {
  let mockInteraction;
  let mockClient;
  let mockPlaylist;
  let mockPlayer;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock the player
    mockPlayer = {
      play: vi.fn()
    };

    // Mock the playlist
    mockPlaylist = {
      player: mockPlayer,
      currentIndex: 1,
      tracks: [
        {
          title: "Tweezer",
          show_date: "2023-12-31",
          slug: "tweezer",
          mp3_url: "https://example.com/tweezer.mp3"
        },
        {
          title: "Run Like an Antelope",
          show_date: "2023-12-31",
          slug: "run-like-an-antelope",
          mp3_url: "https://example.com/antelope.mp3"
        }
      ],
      voiceChannelName: "Test Voice Channel"
    };

    // Mock the client
    mockClient = {
      playlists: new Map([
        ["123", mockPlaylist]
      ])
    };

    // Mock the interaction
    mockInteraction = {
      guild: {
        id: "123"
      },
      reply: vi.fn()
    };
  });

  it("skips to the previous track when there are previous tracks", async () => {
    // Arrange
    const mockResource = { someResource: "data" };
    createAudioResource.mockReturnValue(mockResource);

    // Act
    await handlePreviousTrack(mockInteraction, mockClient);

    // Assert
    expect(mockPlaylist.currentIndex).toBe(0);
    expect(createAudioResource).toHaveBeenCalledWith("https://example.com/tweezer.mp3");
    expect(mockPlayer.play).toHaveBeenCalledWith(mockResource);
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      embeds: [expect.any(Object)],
      flags: MessageFlags.Ephemeral
    });
  });

  it("handles case when there is no playlist", async () => {
    // Arrange
    mockClient.playlists = new Map();

    // Act
    await handlePreviousTrack(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "❌ There's no previous track to skip to",
      flags: MessageFlags.Ephemeral
    });
  });

  it("handles case when there is no player", async () => {
    // Arrange
    mockPlaylist.player = null;

    // Act
    await handlePreviousTrack(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "❌ There's no previous track to skip to",
      flags: MessageFlags.Ephemeral
    });
  });

  it("handles case when at the beginning of the playlist", async () => {
    // Arrange
    mockPlaylist.currentIndex = 0;

    // Act
    await handlePreviousTrack(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "❌ There's no previous track to skip to",
      flags: MessageFlags.Ephemeral
    });
  });

  it("handles case when track has no mp3_url", async () => {
    // Arrange
    mockPlaylist.tracks[0].mp3_url = null;

    // Act
    await handlePreviousTrack(mockInteraction, mockClient);

    // Assert
    // Should recursively call handlePreviousTrack again until reaching the beginning
    expect(mockPlaylist.currentIndex).toBe(0);
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "❌ There's no previous track to skip to",
      flags: MessageFlags.Ephemeral
    });
  });

  it("handles errors during track skip", async () => {
    // Arrange
    mockPlayer.play.mockImplementation(() => {
      throw new Error("Playback error");
    });

    // Act
    await handlePreviousTrack(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "❌ Unable to play previous track",
      flags: MessageFlags.Ephemeral
    });
  });
});
