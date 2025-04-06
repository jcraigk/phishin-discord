import fetch from "node-fetch";

const BASE_URL = "https://phish.in/api/v2";

// Get a random show
export async function getRandomShow() {
  const response = await fetch(`${BASE_URL}/random-show`);
  return response.json();
}
