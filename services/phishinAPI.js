import fetch from "node-fetch";

const BASE_URL = "https://phish.in/api/v2";

async function fetchFromAPI(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchRandomShow() {
  return fetchFromAPI("/shows/random");
}

export async function fetchShow(date) {
  return fetchFromAPI(`/shows/${date}`);
}
