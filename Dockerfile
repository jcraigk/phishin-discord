FROM node:20-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    ffmpeg \
    libopus0 \
    libopus-dev \
    libasound2 \
    alsa-utils \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for ffmpeg
ENV FFMPEG_BINARY=ffmpeg
ENV FFPROBE_BINARY=ffprobe

# Set environment variables for audio
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV DISPLAY=:99

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm install prism-media

# Copy app source
COPY . .

# Rebuild better-sqlite3 from source
RUN npm rebuild better-sqlite3

# Start the bot
CMD ["npm", "run", "dev"]
