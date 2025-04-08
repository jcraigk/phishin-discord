import { describe, it, expect, vi, beforeEach } from "vitest";
import handlePause from "../../commands/pause.js";
import { MessageFlags } from "discord.js";

// Mock discord.js
vi.mock("discord.js", () => ({
  MessageFlags: {
    Ephemeral: 64
  }
}));

describe("pause command", () => {
  let mockInteraction;
  let mockClient;
  let mockPlaylist;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock the interaction
    mockInteraction = {
      guild: {
        id: "123456789"
      },
      reply: vi.fn()
    };

    // Mock the player
    const mockPlayer = {
      pause: vi.fn()
    };

    // Mock the playlist
    mockPlaylist = {
      player: mockPlayer,
      isPaused: false
    };

    // Mock the client
    mockClient = {
      playlists: new Map([
        ["123456789", mockPlaylist]
      ])
    };
  });

  it("pauses playback when player is active", async () => {
    // Act
    await handlePause(mockInteraction, mockClient);

    // Assert
    expect(mockPlaylist.player.pause).toHaveBeenCalled();
    expect(mockPlaylist.isPaused).toBe(true);
    expect(mockClient.playlists.get("123456789")).toBe(mockPlaylist);
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "Playback paused. Use `/phishin play` to resume.",
      flags: MessageFlags.Ephemeral
    });
  });

  it("handles case when playlist or player doesn't exist", async () => {
    // Arrange
    mockClient.playlists.get("123456789").player = null;

    // Act
    await handlePause(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "Playback is currently stopped",
      flags: MessageFlags.Ephemeral
    });
  });

  it("handles error when pausing playback", async () => {
    // Arrange
    mockPlaylist.player.pause.mockImplementation(() => {
      throw new Error("Pause error");
    });

    // Act
    await handlePause(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: "❌ An error occurred while trying to pause playback.",
      flags: MessageFlags.Ephemeral
    });
  });
});
