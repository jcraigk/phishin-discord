# Phish.in Discord Bot

A Discord bot for [Phish.in](https://github.com/jcraigk/phishin) that can display setlists and play music in voice channels. Interfaces with [Phish.in API v2](https://petstore.swagger.io/?url=https%3A%2F%2Fphish.in/api/v2/swagger_doc) on the backend. See instructions below for development and self hosting.


## Commands

The bot implements the `/phishin` slash command and understands the following subcommands:

```
/phishin help - Show this help message
/phishin show [date] - Show setlist for a specific date
/phishin play [query] - Play music based on your input (or random show if blank)
/phishin [stop|pause|next|previous] - Control playback
/phishin playlist - Show the current playlist
/phishin add [query] - Add track(s) to the playlist
/phishin remove [track #] - Remove a track from the playlist

[query] can be:
- Date (e.g., 1995-10-31, Oct 31 1995): Specific show
- Year (e.g., 1997): Pick a random show from that year
- Song name (e.g., Tweezer): Pick random versions of that song
- Venue name (e.g., MSG): Pick a random show from that venue
- URL (e.g., https://phish.in/...): Specific show, track, or playlist
```


## Setup

### Create Your Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Under the "Privileged Gateway Intents" section, enable:
   - Message Content Intent
   - Server Members Intent
5. Copy your bot token (click "Reset Token" if necessary)


### Clone the code and assign bot token

1. Clone this repository (locally or to a production server)
2. Run `make install`
3. Create a `.env` file in the root directory
4. Add your bot token to the `.env` file as `DISCORD_TOKEN`
5. If FFmpeg is not automatically detected, run `which ffmpeg` in your terminal and add the path to your `.env` file as `FFMPEG_PATH=/path/to/ffmpeg`


### For Local Development

1. Run `make dev`


### Running in Docker

You can also run the bot in a Docker container:

1. Build the Docker image: `make build`
2. Start the container: `make up`
3. View logs: `make logs`
4. Stop the container: `make down`


### Deploying with Dokku

This project is configured to run with [Dokku](https://dokku.com/). To deploy:

1. Create a new app on your Dokku server: `dokku apps:create phishin-discord`
2. Set your Discord token: `dokku config:set phishin-discord DISCORD_TOKEN=your_token_here`
3. Set the guild limit (integer) if you want multiple guilds to join: `dokku config:set phishin-discord GUILD_LIMIT=your_number_here`
4. Set the worker scale to 1: `dokku ps:scale phishin-discord worker=1`
5. Deploy by pushing to your Dokku remote: `git push dokku main`

Dokku will automatically detect and use the Dockerfile for deployment.


### Deploying with PM2

To keep the bot running continuously on a remote server, try PM2:

1. Install PM2 globally: `npm install -g pm2`
2. Start the bot with PM2: `pm2 start index.js --name "phishin-discord"`
3. Configure PM2 to start on system boot:
```
pm2 startup
pm2 save
```
4. To view logs: `pm2 logs phishin-discord`


### Invite Your Bot to Servers

1. In the Developer Portal, go to "OAuth2" → "URL Generator"
2. Under "Scopes" section, select:
   - `applications.commands`
   - `bot`
3. Under "Bot Permissions" section (appears after selecting "bot"), select:
   - Text Permissions:
     - Send Messages
     - Use Slash Commands
   - Voice Permissions:
     - Connect
     - Speak
4. Copy the generated URL at the bottom of the page and open it in your browser
5. Select the server you want to add the bot to
6. Click "Authorize"


## Contributions

Software maintained by [Justin Craig-Kuhn](https://github.com/jcraigk).
