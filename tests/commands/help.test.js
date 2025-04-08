import { describe, it, expect, vi, beforeEach } from "vitest";
import handleHelp from "../../commands/help.js";

// Mock discord.js
vi.mock("discord.js", () => ({
  MessageFlags: {
    Ephemeral: 64
  }
}));

describe("help command", () => {
  let mockInteraction;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock the interaction object
    mockInteraction = {
      reply: vi.fn()
    };
  });

  it("replies with the help message", async () => {
    // Act
    await handleHelp(mockInteraction);

    // Assert
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: expect.stringContaining("/phishin help"),
      flags: 64
    });
  });

  it("includes command descriptions in the help message", async () => {
    // Act
    await handleHelp(mockInteraction);

    // Assert
    const replyContent = mockInteraction.reply.mock.calls[0][0].content;

    // Check commands
    expect(replyContent).toContain("/phishin help");
    expect(replyContent).toContain("/phishin show");
    expect(replyContent).toContain("/phishin play");
    expect(replyContent).toContain("/phishin playlist");
  });

  it("includes query format explanations in the help message", async () => {
    // Act
    await handleHelp(mockInteraction);

    // Assert
    const replyContent = mockInteraction.reply.mock.calls[0][0].content;

    // Check that all query formats are explained
    expect(replyContent).toContain("Date");
    expect(replyContent).toContain("Year");
    expect(replyContent).toContain("Song name");
    expect(replyContent).toContain("Venue name");
    expect(replyContent).toContain("URL");
  });
});
