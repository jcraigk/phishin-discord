import { describe, it, expect, vi, beforeEach } from "vitest";
import handleStop from "../../commands/stop.js";
import { MessageFlags } from "discord.js";

// Mock discord.js
vi.mock("discord.js", () => ({
  MessageFlags: {
    Ephemeral: 64
  }
}));

describe("stop command", () => {
  let mockInteraction;
  let mockClient;
  let mockPlaylist;
  let mockPlayer;
  let mockConnection;
  let mockPlaylists;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock the player
    mockPlayer = {
      stop: vi.fn()
    };

    // Mock the connection
    mockConnection = {
      destroy: vi.fn()
    };

    // Mock the playlist
    mockPlaylist = {
      player: mockPlayer,
      connection: mockConnection,
      tracks: [
        {
          title: "Tweezer",
          show_date: "2023-12-31",
          slug: "tweezer",
          mp3_url: "https://example.com/tweezer.mp3"
        }
      ]
    };

    // Create a mock Map with a spy for delete
    mockPlaylists = new Map();
    mockPlaylists.delete = vi.fn();
    mockPlaylists.set("123", mockPlaylist);

    // Mock the client
    mockClient = {
      playlists: mockPlaylists
    };

    // Mock the interaction
    mockInteraction = {
      guild: {
        id: "123"
      },
      deferReply: vi.fn(),
      editReply: vi.fn()
    };
  });

  it("stops playback and clears playlist when player is active", async () => {
    // Act
    await handleStop(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({
      flags: MessageFlags.Ephemeral
    });
    expect(mockPlayer.stop).toHaveBeenCalled();
    expect(mockConnection.destroy).toHaveBeenCalled();
    expect(mockPlaylists.delete).toHaveBeenCalledWith("123");
    expect(mockInteraction.editReply).toHaveBeenCalledWith({
      content: "Playback stopped and playlist cleared"
    });
  });

  it("handles case when there is no playlist", async () => {
    // Arrange
    mockClient.playlists = new Map();
    mockClient.playlists.delete = vi.fn();

    // Act
    await handleStop(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({
      flags: MessageFlags.Ephemeral
    });
    expect(mockInteraction.editReply).toHaveBeenCalledWith({
      content: "Player already stopped"
    });
  });

  it("handles case when there is no player", async () => {
    // Arrange
    mockPlaylist.player = null;

    // Act
    await handleStop(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({
      flags: MessageFlags.Ephemeral
    });
    expect(mockInteraction.editReply).toHaveBeenCalledWith({
      content: "Player already stopped"
    });
  });

  it("handles errors during stop", async () => {
    // Arrange
    mockPlayer.stop.mockImplementation(() => {
      throw new Error("Stop error");
    });

    // Act
    await handleStop(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({
      flags: MessageFlags.Ephemeral
    });
    expect(mockInteraction.editReply).toHaveBeenCalledWith(
      "❌ An error occurred while trying to stop playback"
    );
  });
});
