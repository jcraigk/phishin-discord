import { describe, it, expect, vi, beforeEach } from "vitest";
import handleAdd from "../../commands/add.js";
import { fetchTracksByQuery } from "../../services/phishinAPI.js";
import { getOrCreatePlaylist } from "../../utils/playlistUtils.js";

// Mock the dependencies
vi.mock("../../services/phishinAPI.js", () => ({
  fetchTracksByQuery: vi.fn()
}));

vi.mock("../../utils/playlistUtils.js", () => ({
  getOrCreatePlaylist: vi.fn()
}));

vi.mock("discord.js", () => ({
  MessageFlags: {
    Ephemeral: 64
  }
}));

describe("add command", () => {
  let mockInteraction;
  let mockClient;
  let mockPlaylist;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock the interaction object
    mockInteraction = {
      options: {
        getString: vi.fn()
      },
      deferReply: vi.fn(),
      editReply: vi.fn(),
      guild: {
        id: "123456789"
      }
    };

    // Mock the client object
    mockClient = {
      playlists: new Map()
    };

    // Mock the playlist object
    mockPlaylist = {
      tracks: []
    };

    // Setup default mock implementations
    mockInteraction.options.getString.mockReturnValue("tweezer");
    fetchTracksByQuery.mockResolvedValue([{ title: "Tweezer" }]);
    getOrCreatePlaylist.mockReturnValue(mockPlaylist);
  });

  it("adds tracks to the playlist when tracks are found", async () => {
    // Arrange
    const mockTracks = [{ title: "Tweezer" }];
    fetchTracksByQuery.mockResolvedValue(mockTracks);

    // Act
    await handleAdd(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: 64 });
    expect(fetchTracksByQuery).toHaveBeenCalledWith("tweezer");
    expect(getOrCreatePlaylist).toHaveBeenCalledWith(mockClient, "123456789");
    expect(mockPlaylist.tracks).toEqual(mockTracks);
    expect(mockInteraction.editReply).toHaveBeenCalledWith("➕ Added 1 track to the playlist");
  });

  it("adds multiple tracks to the playlist when multiple tracks are found", async () => {
    // Arrange
    const mockTracks = [
      { title: "Tweezer" },
      { title: "Run Like an Antelope" }
    ];
    fetchTracksByQuery.mockResolvedValue(mockTracks);

    // Act
    await handleAdd(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: 64 });
    expect(fetchTracksByQuery).toHaveBeenCalledWith("tweezer");
    expect(getOrCreatePlaylist).toHaveBeenCalledWith(mockClient, "123456789");
    expect(mockPlaylist.tracks).toEqual(mockTracks);
    expect(mockInteraction.editReply).toHaveBeenCalledWith("➕ Added 2 tracks to the playlist");
  });

  it("handles the case when no tracks are found", async () => {
    // Arrange
    fetchTracksByQuery.mockResolvedValue([]);

    // Act
    await handleAdd(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: 64 });
    expect(fetchTracksByQuery).toHaveBeenCalledWith("tweezer");
    expect(getOrCreatePlaylist).not.toHaveBeenCalled();
    expect(mockInteraction.editReply).toHaveBeenCalledWith("❌ No tracks found matching your query");
  });

  it("handles the case when tracks is null", async () => {
    // Arrange
    fetchTracksByQuery.mockResolvedValue(null);

    // Act
    await handleAdd(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: 64 });
    expect(fetchTracksByQuery).toHaveBeenCalledWith("tweezer");
    expect(getOrCreatePlaylist).not.toHaveBeenCalled();
    expect(mockInteraction.editReply).toHaveBeenCalledWith("❌ No tracks found matching your query");
  });

  it("handles errors that occur during execution", async () => {
    // Arrange
    fetchTracksByQuery.mockRejectedValue(new Error("API error"));

    // Act
    await handleAdd(mockInteraction, mockClient);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: 64 });
    expect(fetchTracksByQuery).toHaveBeenCalledWith("tweezer");
    expect(getOrCreatePlaylist).not.toHaveBeenCalled();
    expect(mockInteraction.editReply).toHaveBeenCalledWith("❌ An error occurred while adding tracks to the playlist");
  });
});
