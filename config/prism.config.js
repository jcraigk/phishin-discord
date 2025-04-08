import { execSync } from 'node:child_process';
import prism from "prism-media";

// Debug environment variables
console.log("Environment variables in prism.config.js:");
console.log("FFMPEG_PATH:", process.env.FFMPEG_PATH);
console.log("PATH:", process.env.PATH);

// Get FFmpeg path from environment variable or use default
const ffmpegPath = process.env.FFMPEG_PATH || "/usr/bin/ffmpeg";
console.log("Using FFmpeg path:", ffmpegPath);

// Configure prism to use system ffmpeg
const getFFmpegInfo = () => {
  try {
    console.log(`Executing: ${ffmpegPath} -version`);
    const output = execSync(`${ffmpegPath} -version`).toString();
    const versionLine = output.split("\n")[0];
    const version = versionLine.split(" ").slice(2, 3).join(" ");

    return {
      command: ffmpegPath,
      output,
      version
    };
  } catch (error) {
    console.error(`Error getting FFmpeg info: ${error.message}`);
    console.error(`FFmpeg path: ${ffmpegPath}`);
    console.error(`Please check if FFmpeg is installed and the path is correct.`);

    // Return a fallback object
    return {
      command: ffmpegPath,
      output: "FFmpeg info not available",
      version: "unknown"
    };
  }
};

prism.FFmpeg.getInfo = () => getFFmpegInfo();
