import { describe, it, expect, beforeEach, vi } from "vitest";
import * as phishinAPI from "../../services/phishinAPI.js";
import fetch from "node-fetch";
import * as chrono from "chrono-node";

// Mock node-fetch
vi.mock("node-fetch", () => ({
  default: vi.fn()
}));

// Mock chrono-node
vi.mock("chrono-node", () => ({
  parseDate: vi.fn()
}));

describe("phishinAPI", () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Default mock implementation for fetch
    fetch.mockImplementation(async (url) => {
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: "mock data" })
      };
    });
  });

  describe("fetchFromAPI", () => {
    it("handles successful API calls", async () => {
      const mockData = { shows: [{ date: "2023-12-31" }] };
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => mockData
      }));

      const result = await phishinAPI.fetchShow("2023-12-31");
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith("https://phish.in/api/v2/shows/2023-12-31");
    });

    it("handles 404 responses", async () => {
      fetch.mockImplementationOnce(async () => ({
        ok: false,
        status: 404
      }));

      const result = await phishinAPI.fetchShow("2023-12-31");
      expect(result).toEqual({ notFound: true });
    });

    it("handles API errors", async () => {
      fetch.mockImplementationOnce(async () => ({
        ok: false,
        status: 500,
        statusText: "Internal Server Error"
      }));

      await expect(phishinAPI.fetchShow("2023-12-31")).rejects.toThrow("Failed to fetch /shows/2023-12-31: 500 Internal Server Error");
    });
  });

  describe("fetchRandomShow", () => {
    it("fetches a random show", async () => {
      const mockShow = { date: "2023-12-31", tracks: [{ title: "Tweezer" }] };
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => mockShow
      }));

      const result = await phishinAPI.fetchRandomShow();
      expect(result).toEqual(mockShow);
      expect(fetch).toHaveBeenCalledWith("https://phish.in/api/v2/shows/random");
    });
  });

  describe("fetchShow", () => {
    it("fetches a show by date", async () => {
      const mockShow = { date: "2023-12-31", tracks: [{ title: "Tweezer" }] };
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => mockShow
      }));

      const result = await phishinAPI.fetchShow("2023-12-31");
      expect(result).toEqual(mockShow);
      expect(fetch).toHaveBeenCalledWith("https://phish.in/api/v2/shows/2023-12-31");
    });
  });

  describe("fetchRandomShowByYear", () => {
    it("fetches a random show from a specific year", async () => {
      const mockShows = { shows: [{ date: "2023-12-31" }] };
      const mockShow = { date: "2023-12-31", tracks: [{ title: "Tweezer" }] };

      // First call to get shows for the year
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => mockShows
      }));

      // Second call to get the specific show
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => mockShow
      }));

      const result = await phishinAPI.fetchRandomShowByYear("2023");
      expect(result).toEqual(mockShow);
      expect(fetch).toHaveBeenCalledWith("https://phish.in/api/v2/shows?year=2023&per_page=1000");
      expect(fetch).toHaveBeenCalledWith("https://phish.in/api/v2/shows/2023-12-31");
    });

    it("returns null if no shows found for the year", async () => {
      fetch.mockImplementationOnce(async () => ({
        ok: false,
        status: 404
      }));

      const result = await phishinAPI.fetchRandomShowByYear("2023");
      expect(result).toBeNull();
    });
  });

  describe("fetchTracksByQuery", () => {
    it("handles phish.in URLs", async () => {
      const mockTracks = [{ title: "Tweezer", slug: "tweezer" }];

      // Mock the show data for the URL
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ tracks: mockTracks })
      }));

      const result = await phishinAPI.fetchTracksByQuery("https://phish.in/2023-12-31/tweezer");
      expect(result).toEqual([mockTracks[0]]);
    });

    it("handles year queries", async () => {
      const mockTracks = [{ title: "Tweezer" }];

      // Mock the random show by year
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ shows: [{ date: "2023-12-31" }] })
      }));

      // Mock the show data
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ tracks: mockTracks })
      }));

      const result = await phishinAPI.fetchTracksByQuery("2023");
      expect(result).toEqual(mockTracks);
    });

    it("handles date queries", async () => {
      const mockTracks = [{ title: "Tweezer" }];

      // Mock the show data for the date
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ tracks: mockTracks })
      }));

      const result = await phishinAPI.fetchTracksByQuery("2023-12-31");
      expect(result).toEqual(mockTracks);
    });

    it.skip("handles human readable date queries", async () => {
      const mockTracks = [{ title: "Tweezer" }];

      // Mock the date parsing to return a consistent result
      const mockDate = new Date("2023-12-31");
      chrono.parseDate.mockReturnValue(mockDate);

      // Mock the show data for the parsed date
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ tracks: mockTracks })
      }));

      const result = await phishinAPI.fetchTracksByQuery("New Year's Eve 2023");
      expect(result).toEqual(mockTracks);
      expect(chrono.parseDate).toHaveBeenCalledWith("New Year's Eve 2023");
      expect(fetch).toHaveBeenCalledWith("https://phish.in/api/v2/shows/2023-12-31");
    });

    it.skip("handles search queries for songs", async () => {
      const mockTracks = [{ title: "Tweezer" }];

      // Mock the search results
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ songs: [{ slug: "tweezer" }] })
      }));

      // Mock the song data
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ title: "Tweezer" })
      }));

      // Mock the tracks data
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ tracks: mockTracks })
      }));

      const result = await phishinAPI.fetchTracksByQuery("tweezer");
      expect(result).toEqual(mockTracks);
    });

    it("handles search queries for venues", async () => {
      const mockTracks = [{ title: "Tweezer" }];

      // Mock the search results
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ venues: [{ slug: "msg" }] })
      }));

      // Mock the venue data
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ name: "Madison Square Garden" })
      }));

      // Mock the shows data
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ shows: [{ date: "2023-12-31" }] })
      }));

      // Mock the show data
      fetch.mockImplementationOnce(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ tracks: mockTracks })
      }));

      const result = await phishinAPI.fetchTracksByQuery("Madison Square Garden");
      expect(result).toEqual(mockTracks);
    });
  });
});
