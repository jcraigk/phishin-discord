import { execSync } from 'node:child_process';
import prism from "prism-media";

// Configure prism to use system ffmpeg (required for Docker)
const getFFmpegInfo = () => {
  const output = execSync("/usr/bin/ffmpeg -version").toString();
  const versionLine = output.split("\n")[0];
  const version = versionLine.split(" ").slice(2, 3).join(" ");

  return {
    command: "/usr/bin/ffmpeg",
    output,
    version
  };
};

prism.FFmpeg.getInfo = () => getFFmpegInfo();
