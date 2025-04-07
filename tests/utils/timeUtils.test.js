import { describe, it, expect } from "vitest";
import { parseFlexibleDate, formatDate, formatDuration } from "../../utils/timeUtils.js";

describe("parseFlexibleDate", () => {
  it("parses a date string correctly", () => {
    const result = parseFlexibleDate("Dec 1, 1995");
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString().startsWith("1995-12-01")).toBe(true);
  });

  it("returns null for invalid date", () => {
    expect(parseFlexibleDate("invalid date")).toBeNull();
  });
});

describe("formatDate", () => {
  it("formats a date correctly", () => {
    const date = new Date(Date.UTC(1995, 11, 1)); // Dec 1, 1995 (Month is 0-indexed)
    expect(formatDate(date)).toBe("Dec 1, 1995");
  });

  it("handles invalid date input", () => {
    expect(formatDate("invalid date")).toBeNull();
  });

  it("formats strings or timestamps as dates", () => {
    expect(formatDate("1995-12-01")).toBe("Dec 1, 1995");
  });
});

describe("formatDuration", () => {
  it("formats duration as letters", () => {
    expect(formatDuration(7200000)).toBe("2h 0m");
    expect(formatDuration(3661000)).toBe("1h 1m");
    expect(formatDuration(59000)).toBe("0m 59s");
  });

  it("formats duration as colons", () => {
    expect(formatDuration(7200000, "colons")).toBe("120:00");
    expect(formatDuration(3661000, "colons")).toBe("61:01");
    expect(formatDuration(59000, "colons")).toBe("0:59");
  });

  it("handles negative durations", () => {
    expect(formatDuration(-3661000, "colons")).toBe("61:01");
    expect(formatDuration(-7200000)).toBe("2h 0m");
  });
});
