import * as chrono from "chrono-node";

// Parse dates using chrono-node
export function parseFlexibleDate(dateStr) {
  try {
    const results = chrono.parse(dateStr);

    if (results.length > 0) {
      return results[0].start.date();
    }

    return null;
  } catch (error) {
    console.error("Date parsing error:", error);
    return null;
  }
}

// Format a Date object to YYYY-MM-DD
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Check if the query is just a year
export function isExactYear(str) {
  return /^\d{4}$/.test(str);
}
