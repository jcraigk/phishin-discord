import { describe, it, expect, vi, beforeEach } from "vitest";
import handleShow from "../../commands/show.js";
import { EmbedBuilder, MessageFlags } from "discord.js";
import { fetchRandomShow, fetchShow } from "../../services/phishinAPI.js";
import { parseFlexibleDate } from "../../utils/timeUtils.js";

// Mock discord.js
vi.mock("discord.js", () => ({
  MessageFlags: {
    Ephemeral: 64
  },
  EmbedBuilder: vi.fn().mockImplementation(() => ({
    setTitle: vi.fn().mockReturnThis(),
    setDescription: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    setURL: vi.fn().mockReturnThis(),
    setThumbnail: vi.fn().mockReturnThis()
  }))
}));

// Mock phishinAPI
vi.mock("../../services/phishinAPI.js", () => ({
  fetchRandomShow: vi.fn(),
  fetchShow: vi.fn()
}));

// Mock timeUtils
vi.mock("../../utils/timeUtils.js", () => ({
  parseFlexibleDate: vi.fn(),
  formatDate: vi.fn(date => date)
}));

describe("show command", () => {
  let mockInteraction;
  const mockShowData = {
    date: "2023-12-31",
    venue_name: "Madison Square Garden",
    venue: {
      location: "New York, NY"
    },
    duration: 7200000, // 2 hours in milliseconds
    tracks: [
      {
        title: "Tweezer",
        slug: "tweezer",
        set_name: "Set 1"
      },
      {
        title: "Run Like an Antelope",
        slug: "run-like-an-antelope",
        set_name: "Set 1"
      },
      {
        title: "You Enjoy Myself",
        slug: "you-enjoy-myself",
        set_name: "Set 2"
      },
      {
        title: "Encore",
        slug: "encore",
        set_name: "E"
      }
    ],
    cover_art_urls: {
      medium: "https://example.com/cover.jpg"
    }
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock the interaction
    mockInteraction = {
      options: {
        getString: vi.fn()
      },
      deferReply: vi.fn(),
      editReply: vi.fn()
    };

    // Reset API mocks
    fetchRandomShow.mockReset();
    fetchShow.mockReset();
    parseFlexibleDate.mockReset();
  });

  it("handles random show request", async () => {
    // Arrange
    mockInteraction.options.getString.mockReturnValue(null);
    fetchRandomShow.mockResolvedValue(mockShowData);

    // Act
    await handleShow(mockInteraction);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: MessageFlags.Ephemeral });
    expect(fetchRandomShow).toHaveBeenCalled();
    expect(mockInteraction.editReply).toHaveBeenCalledWith({
      embeds: [expect.any(Object)]
    });
    expect(EmbedBuilder).toHaveBeenCalled();
  });

  it("handles specific date request", async () => {
    // Arrange
    const dateString = "2023-12-31";
    mockInteraction.options.getString.mockReturnValue(dateString);
    parseFlexibleDate.mockReturnValue(dateString);
    fetchShow.mockResolvedValue(mockShowData);

    // Act
    await handleShow(mockInteraction);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: MessageFlags.Ephemeral });
    expect(parseFlexibleDate).toHaveBeenCalledWith(dateString);
    expect(fetchShow).toHaveBeenCalledWith(dateString);
    expect(mockInteraction.editReply).toHaveBeenCalledWith({
      embeds: [expect.any(Object)]
    });
  });

  it("handles invalid date format", async () => {
    // Arrange
    const invalidDate = "invalid-date";
    mockInteraction.options.getString.mockReturnValue(invalidDate);
    parseFlexibleDate.mockReturnValue(null);

    // Act
    await handleShow(mockInteraction);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: MessageFlags.Ephemeral });
    expect(mockInteraction.editReply).toHaveBeenCalledWith(
      '❌ "invalid-date" isn\'t a valid date. Please use YYYY-MM-DD format.'
    );
  });

  it("handles show not found for random request", async () => {
    // Arrange
    mockInteraction.options.getString.mockReturnValue(null);
    fetchRandomShow.mockResolvedValue({ notFound: true });

    // Act
    await handleShow(mockInteraction);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: MessageFlags.Ephemeral });
    expect(mockInteraction.editReply).toHaveBeenCalledWith("❌ Show not found");
  });

  it("handles show not found for specific date", async () => {
    // Arrange
    const dateString = "2023-12-31";
    mockInteraction.options.getString.mockReturnValue(dateString);
    parseFlexibleDate.mockReturnValue(dateString);
    fetchShow.mockResolvedValue({ notFound: true });

    // Act
    await handleShow(mockInteraction);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: MessageFlags.Ephemeral });
    expect(mockInteraction.editReply).toHaveBeenCalledWith("❌ Show not found");
  });

  it("handles network error", async () => {
    // Arrange
    const dateString = "2023-12-31";
    mockInteraction.options.getString.mockReturnValue(dateString);
    parseFlexibleDate.mockReturnValue(dateString);
    fetchShow.mockRejectedValue(new Error("Network error"));

    // Act
    await handleShow(mockInteraction);

    // Assert
    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: MessageFlags.Ephemeral });
    expect(mockInteraction.editReply).toHaveBeenCalledWith("❌ Network error - could not fetch data");
  });

  it("formats setlist correctly", async () => {
    // Arrange
    const dateString = "2023-12-31";
    mockInteraction.options.getString.mockReturnValue(dateString);
    parseFlexibleDate.mockReturnValue(dateString);
    fetchShow.mockResolvedValue(mockShowData);

    // Act
    await handleShow(mockInteraction);

    // Assert
    const embedCall = mockInteraction.editReply.mock.calls[0][0];
    const embed = embedCall.embeds[0];
    expect(embed.setDescription).toHaveBeenCalledWith(expect.stringContaining("Set 1:"));
    expect(embed.setDescription).toHaveBeenCalledWith(expect.stringContaining("Set 2:"));
    expect(embed.setDescription).toHaveBeenCalledWith(expect.stringContaining("Encore:"));
    expect(embed.setDescription).toHaveBeenCalledWith(expect.stringContaining("2h 0m"));
  });
});
