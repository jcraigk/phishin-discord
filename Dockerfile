FROM node:20-slim

RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["node", "./index.js"]
