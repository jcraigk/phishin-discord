FROM node:20-slim

# Install minimal system dependencies
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  ffmpeg \
  && rm -rf /var/lib/apt/lists/*

ENV PATH="/usr/bin:/usr/local/bin:${PATH}"
ENV FFMPEG_PATH="/usr/bin/ffmpeg"
ENV FFMPEG_BINARY="/usr/bin/ffmpeg"

WORKDIR /app

COPY package*.json ./

# Preemptively nuke ffmpeg-static and avoid reinstall
RUN rm -rf node_modules/ffmpeg-static

# Optional: block future installs of ffmpeg-static
RUN npm pkg set resolutions.ffmpeg-static=0.0.0 || true

# Install deps
RUN npm ci --legacy-peer-deps

# Double check it's gone
RUN rm -rf node_modules/ffmpeg-static

# Confirm ffmpeg works
RUN ffmpeg -version
RUN node -e "console.log(require('child_process').execSync('which ffmpeg').toString())" > /app/ffmpeg-check.log

COPY . .

CMD ["node", "./index.js"]
