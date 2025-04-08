FROM node:20-slim

RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  ffmpeg \
  && rm -rf /var/lib/apt/lists/*

ENV IN_DOCKER=true

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .
COPY .env.docker .env

CMD ["node", "./index.js"]
