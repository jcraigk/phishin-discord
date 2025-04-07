# Phish.in Discord Bot

A Discord bot that plays Phish shows from phish.in in voice channels and displays setlists.

See [Phish.in](https://github.com/jcraigk/phishin) for more information about the API.


## Setup

### Create Your Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Under the "Privileged Gateway Intents" section, enable:
   - Message Content Intent
   - Server Members Intent
5. Copy your bot token (click "Reset Token" if necessary)


### Setting Up the Code

1. Clone this repository
2. Run `make install`
3. Create a `.env` file in the root directory
4. Add your bot token to the `.env` file
5. Run `make dev`


### Inviting Your Bot to Servers

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


### Running the Bot

1. Run the bot with `make start` or `make dev`
2. The bot should now be online and ready to use

## Commands

The bot implements the `/phishin` command and understands the following subcommands:

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


# Production Deployment

To keep the bot running continuously on your server, we recommend using PM2:

1. Install PM2 globally: `npm install -g pm2`
2. Start the bot with PM2: `pm2 start index.js --name "phishin-discord"`
3. Configure PM2 to start on system boot:
```
pm2 startup
pm2 save
```
4. To view logs: `pm2 logs phishin-discord`

