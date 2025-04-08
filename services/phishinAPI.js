import fetch from "node-fetch";
import * as chrono from "chrono-node";

const BASE_URL = "https://phish.in/api/v2";

async function fetchFromAPI(endpoint) {
  console.log(`[phishinAPI] BASE_URL: ${BASE_URL}`);
  console.log(`[phishinAPI] endpoint: ${endpoint}`);

  // Ensure endpoint starts with a forward slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Remove any trailing slash from BASE_URL
  const normalizedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

  const url = `${normalizedBaseUrl}${normalizedEndpoint}`;
  console.log(`[phishinAPI] Constructed URL: ${url}`);

  try {
    console.log(`[phishinAPI] Attempting to fetch from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log(`[phishinAPI] Response status: ${response.status}`);
    console.log(`[phishinAPI] Response headers:`, response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[phishinAPI] Error response: ${errorText}`);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`[phishinAPI] Response data (first 100 chars): ${JSON.stringify(data).substring(0, 100)}...`);
    return data;
  } catch (error) {
    console.error(`[phishinAPI] Network error details:`, {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      url: url
    });
    throw new Error(`Network error - could not fetch data: ${error.message}`);
  }
}

export async function fetchRandomShow() {
  console.log('[phishinAPI] Fetching random show...');
  const data = await fetchFromAPI("/shows/random");
  console.log('[phishinAPI] Random show data received:', {
    id: data.id,
    date: data.date,
    tracks: data.tracks ? data.tracks.length : 0
  });
  return data;
}

export async function fetchShow(date) {
  console.log(`[phishinAPI] Fetching show for date: ${date}`);
  const data = await fetchFromAPI(`/shows/${date}`);
  console.log('[phishinAPI] Show data received:', {
    id: data.id,
    date: data.date,
    tracks: data.tracks ? data.tracks.length : 0
  });
  return data;
}

export async function fetchRandomShowByYear(year) {
  const data = await fetchFromAPI(`/shows?year=${year}&per_page=1000`);
  if (data.notFound || !data.shows) return null;
  let date = data.shows[Math.floor(Math.random() * data.shows.length)].date;
  return fetchShow(date);
}

export async function fetchTracksByQuery(query) {
  if (isPhishInUrl(query)) {
    return handlePhishInUrl(query);
  } else if (/^\d{4}$/.test(query)) {
    return handleYearQuery(query);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(query)) {
    return handleDateQuery(query);
  } else if (chrono.parseDate(query)) {
    return handleHumanReadableDateQuery(query);
  } else {
    return handleSearchQuery(query);
  }
}

function isPhishInUrl(str) {
  try {
    const url = new URL(str);
    return url.hostname === "phish.in";
  } catch {
    return false;
  }
}

async function handlePhishInUrl(url) {
  const pathSegments = new URL(url).pathname.split("/").filter(Boolean);
  if (pathSegments.length === 1 && /^\d{4}-\d{2}-\d{2}$/.test(pathSegments[0])) {
    const showData = await fetchShow(pathSegments[0]);
    return showData?.tracks || [];
  } else if (pathSegments.length === 2 && /^\d{4}-\d{2}-\d{2}$/.test(pathSegments[0])) {
    const showData = await fetchShow(pathSegments[0]);
    const track = showData?.tracks.find(t => t.slug === pathSegments[1]);
    return track ? [track] : [];
  } else if (pathSegments[0] === "play" && pathSegments.length === 2) {
    return fetchPlaylistTracks(pathSegments[1]);
  }
  return [];
}

async function handleYearQuery(year) {
  const showData = await fetchRandomShowByYear(year);
  return showData?.tracks || [];
}

async function handleDateQuery(date) {
  const showData = await fetchShow(date);
  return showData?.tracks || [];
}

async function handleHumanReadableDateQuery(dateStr) {
  const parsedDate = chrono.parseDate(dateStr);
  if (parsedDate) return handleDateQuery(parsedDate.toISOString().split("T")[0]);
  return [];
}

async function handleSearchQuery(query) {
  const searchResults = await fetchFromAPI(`/search/${encodeURIComponent(query)}`);
  if (searchResults.notFound) {
    return [];
  }

  if (searchResults.songs && searchResults.songs.length > 0) {
    const songSlug = searchResults.songs[0].slug;
    return fetchRandomTracksBySong(songSlug);
  } else if (searchResults.venues && searchResults.venues.length > 0) {
    const venueSlug = searchResults.venues[0].slug;
    const show = await fetchRandomShowByVenue(venueSlug);
    return show.tracks;
  }
  return [];
}

async function fetchRandomTracksBySong(songSlug, num = 20) {
  try {
    const songData = await fetchFromAPI(`/songs/${songSlug}`);
    if (!songData || songData.notFound) {
      console.error(`Song not found for slug: ${songSlug}`);
      return [];
    }

    const tracksData = await fetchFromAPI(`/tracks?song_slug=${songSlug}&per_page=1000`);
    if (!tracksData || tracksData.notFound || !tracksData.tracks || tracksData.tracks.length === 0) {
      console.error(`No tracks found for song slug: ${songSlug}`);
      return [];
    }

    const shuffledTracks = tracksData.tracks.sort(() => 0.5 - Math.random());
    return shuffledTracks.slice(0, num);
  } catch (error) {
    console.error("Error fetching tracks by song slug:", error);
    return [];
  }
}

async function fetchRandomShowByVenue(venueSlug) {
  try {
    const venueData = await fetchFromAPI(`/venues/${venueSlug}`);
    if (!venueData || venueData.notFound) {
      console.error(`Venue not found for slug: ${venueSlug}`);
      return null;
    }

    const showsData = await fetchFromAPI(`/shows?venue_slug=${venueSlug}&per_page=1000`);
    if (!showsData || showsData.notFound || !showsData.shows || showsData.shows.length === 0) {
      console.error(`No shows found for venue slug: ${venueSlug}`);
      return null;
    }

    const randomIndex = Math.floor(Math.random() * showsData.shows.length);
    const randomShow = showsData.shows[randomIndex];

    return fetchShow(randomShow.date);
  } catch (error) {
    console.error("Error fetching random show by venue:", error);
    return null;
  }
}

async function fetchPlaylistTracks(playlistSlug) {
  const data = await fetchFromAPI(`/playlists/${playlistSlug}`);
  if (data.notFound || !data.entries) return [];
  return data.entries.map(entry => entry.track);
}
