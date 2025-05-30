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
    // console.error("Date parsing error:", error);
    return null;
  }
}

// Format a date as "Dec 1, 1995"
export function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  if (isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
}

// Format ms as "3h 10m" (defualt style `letters`) or "8:23" (style `colons`)
export function formatDuration(ms, style = 'letters') {
  if (ms < 0) ms = -ms;

  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (style === 'colons') {
    return `${totalMinutes}:${String(seconds).padStart(2, '0')}`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  }
}
