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

// Check if the query is just a year
export function isExactYear(str) {
  return /^\d{4}$/.test(str);
}

// Format a date as "Dec 1, 1995"
export function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date); // Convert to Date object if it's a string
  }

  if (isNaN(date.getTime())) {
    console.error("Invalid date provided to formatDate");
    return null;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
