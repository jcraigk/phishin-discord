import { describe, it, expect, beforeEach, vi } from "vitest";
import { getOrCreatePlaylist } from "../../utils/playlistUtils.js";
import { joinVoiceChannel, createAudioPlayer } from "@discordjs/voice";

// Mock the @discordjs/voice module
vi.mock("@discordjs/voice", () => ({
  joinVoiceChannel: vi.fn(),
  createAudioPlayer: vi.fn()
}));

describe("getOrCreatePlaylist", () => {
  let mockClient;
  let mockVoiceChannel;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock the client
    mockClient = {
      playlists: new Map()
    };

    // Mock the voice channel
    mockVoiceChannel = {
      id: "123456789",
      name: "Test Voice Channel",
      guild: {
        voiceAdapterCreator: vi.fn()
      }
    };

    // Mock the createAudioPlayer function
    createAudioPlayer.mockReturnValue({
      play: vi.fn(),
      stop: vi.fn(),
      on: vi.fn(),
      once: vi.fn()
    });

    // Mock the joinVoiceChannel function
    joinVoiceChannel.mockReturnValue({
      subscribe: vi.fn(),
      destroy: vi.fn()
    });
  });

  it("creates a new playlist if one does not exist", () => {
    const guildId = "987654321";

    const playlist = getOrCreatePlaylist(mockClient, guildId, mockVoiceChannel);

    // Check that the playlist was created
    expect(playlist).toBeDefined();
    expect(playlist.tracks).toEqual([]);
    expect(playlist.currentIndex).toBe(0);
    expect(playlist.isPaused).toBe(false);
    expect(playlist.isActive).toBe(false);
    expect(playlist.voiceChannelName).toBe(mockVoiceChannel.name);

    // Check that the playlist was added to the client
    expect(mockClient.playlists.get(guildId)).toBe(playlist);

    // Check that the player and connection were created
    expect(createAudioPlayer).toHaveBeenCalled();
    expect(joinVoiceChannel).toHaveBeenCalledWith({
      channelId: mockVoiceChannel.id,
      guildId,
      adapterCreator: mockVoiceChannel.guild.voiceAdapterCreator
    });
  });

  it("returns an existing playlist if one exists", () => {
    const guildId = "987654321";

    // Create a playlist first
    const existingPlaylist = getOrCreatePlaylist(mockClient, guildId, mockVoiceChannel);

    // Reset the mocks
    vi.clearAllMocks();

    // Get the playlist again
    const playlist = getOrCreatePlaylist(mockClient, guildId, mockVoiceChannel);

    // Check that the same playlist was returned
    expect(playlist).toBe(existingPlaylist);

    // Check that the player and connection were not created again
    expect(createAudioPlayer).not.toHaveBeenCalled();
    expect(joinVoiceChannel).not.toHaveBeenCalled();
  });

  it("creates a player and connection if a voice channel is provided later", () => {
    const guildId = "987654321";

    // Create a playlist without a voice channel
    const playlist = getOrCreatePlaylist(mockClient, guildId);

    // Reset the mocks
    vi.clearAllMocks();

    // Get the playlist again with a voice channel
    getOrCreatePlaylist(mockClient, guildId, mockVoiceChannel);

    // Check that the player and connection were created
    expect(createAudioPlayer).toHaveBeenCalled();
    expect(joinVoiceChannel).toHaveBeenCalledWith({
      channelId: mockVoiceChannel.id,
      guildId,
      adapterCreator: mockVoiceChannel.guild.voiceAdapterCreator
    });

    // Check that the playlist was updated
    expect(playlist.player).toBeDefined();
    expect(playlist.connection).toBeDefined();
    expect(playlist.voiceChannelName).toBe(mockVoiceChannel.name);
  });

  it("does not create a player or connection if no voice channel is provided", () => {
    const guildId = "987654321";

    const playlist = getOrCreatePlaylist(mockClient, guildId);

    // Check that the playlist was created
    expect(playlist).toBeDefined();

    // Check that the player and connection were not created
    expect(playlist.player).toBeNull();
    expect(playlist.connection).toBeNull();
    expect(playlist.voiceChannelName).toBeNull();

    // Check that the player and connection functions were not called
    expect(createAudioPlayer).not.toHaveBeenCalled();
    expect(joinVoiceChannel).not.toHaveBeenCalled();
  });
});
