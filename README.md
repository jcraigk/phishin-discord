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
2. Run `npm install`
3. Create a `.env` file in the root directory
4. Add your bot token to the `.env` file:


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

1. Run the bot with `node index.js`
2. The bot should now be online and ready to use

## Commands

* `/phishin` - Shows help information
* `/phishin play` - Plays a random Phish show in your voice channel
* `/phishin play [date]` - Plays a specific show (format: YYYY-MM-DD)

## Troubleshooting

- Make sure all dependencies are installed
- Check that your bot token is correctly set in the `.env` file
- Ensure the bot has the correct permissions on your server
- If slash commands aren't working, try reinviting the bot with the applications.commands scope
