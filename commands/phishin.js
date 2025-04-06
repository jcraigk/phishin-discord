const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const chrono = require("chrono-node");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("phishin")
    .setDescription("Interface with the Phish.in API")
    .addSubcommand(subcommand =>
      subcommand
        .setName("help")
        .setDescription("Show help information for using the Phish.in bot")
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("show")
        .setDescription("Display setlist for a specific show")
        .addStringOption(option =>
          option
            .setName("date")
            .setDescription("Show date in YYYY-MM-DD format (e.g., 1995-10-31)")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("play")
        .setDescription("Play Phish content")
        .addStringOption(option =>
          option
            .setName("query")
            .setDescription("Date, year, song name, or venue")
            .setRequired(false)
        )
    ),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "help") {
      await interaction.reply({
        content: "**Commands:**\n\n" +
                 "`/phishin help` - Show this help message\n" +
                 "`/phishin show [date]` - Show info/setlist for a specific date\n" +
                 "`/phishin play` - Play a random Phish show in your voice channel\n" +
                 "`/phishin play [query]` - Play based on your input:\n" +
                 "  • Date (1995-10-31, Oct 31 1995, etc.): Play that specific show\n" +
                 "  • Year (1997): Play a random show from that year\n" +
                 "  • Song name (Tweezer): Play versions of that song\n" +
                 "  • Venue name (Madison Square Garden): Play shows from that venue\n" +
                 "  • Phish.in URL (show, track, or playlist)\n\n" +
                 "API provided by `https://phish.in`",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (subcommand === "show") {
      const dateInput = interaction.options.getString("date");

      await interaction.deferReply();

      const parsedDate = parseFlexibleDate(dateInput);

      if (!parsedDate) {
        await interaction.editReply(`Could not recognize "${dateInput}" as a valid date. Please use a format like "YYYY-MM-DD" or "Month Day, Year".`);
        return;
      }

      const formattedDate = formatDate(parsedDate);
      await handleShowInfo(interaction, formattedDate);
    }

    if (subcommand === "play") {
      // Rest of your code remains the same
      const query = interaction.options.getString("query");

      // Check if user is in a voice channel
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        await interaction.reply({
          content: "You need to be in a voice channel to play music!",
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      await interaction.deferReply();

      // Handle the query interpretation here
      if (!query) {
        // Play random show
        await handleRandomShow(interaction);
      } else if (isExactYear(query)) {
        // Play random show from specific year
        await handleYearShow(interaction, query);
      } else {
        // Try to parse as a date first
        const parsedDate = parseFlexibleDate(query);

        if (parsedDate) {
          // It's a valid date
          const formattedDate = formatDate(parsedDate);
          await handleDateShow(interaction, formattedDate);
        } else {
          // Try to match as song name or venue
          await handleSearch(interaction, query);
        }
      }
    }
  }
};

// Add this new function for handling show info
async function handleShowInfo(interaction, date) {
  try {
    // Fetch show information from the API
    const response = await fetch(`https://phish.in/api/v1/shows/${date}`);

    if (!response.ok) {
      await interaction.editReply(`No show found for date: ${date}`);
      return;
    }

    const show = await response.json();
    const showData = show.data;

    // Create a formatted setlist display
    let setlistDisplay = `**${showData.date}** - ${showData.venue_name}, ${showData.location}\n\n`;

    // Group tracks by set
    const setMap = {};

    showData.tracks.forEach(track => {
      if (!setMap[track.set]) {
        setMap[track.set] = [];
      }
      setMap[track.set].push(track);
    });

    // Add each set to the display
    Object.keys(setMap).sort().forEach(setName => {
      const tracks = setMap[setName];

      // Format set name (capitalize "Encore", etc.)
      let formattedSetName = setName;
      if (setName.toLowerCase() === "e") {
        formattedSetName = "Encore";
      } else if (setName.match(/^set\s*\d+$/i)) {
        formattedSetName = "Set " + setName.replace(/^set\s*(\d+)$/i, "$1");
      }

      setlistDisplay += `**${formattedSetName}:**\n`;

      // Add tracks
      tracks.forEach((track, index) => {
        let trackDisplay = `${index + 1}. ${track.title}`;

        // Add duration
        if (track.duration) {
          const minutes = Math.floor(track.duration / 60);
          const seconds = track.duration % 60;
          trackDisplay += ` (${minutes}:${seconds.toString().padStart(2, "0")})`;
        }

        setlistDisplay += `${trackDisplay}\n`;
      });

      setlistDisplay += "\n";
    });

    // Add a link to phish.in
    setlistDisplay += `\nListen: https://phish.in/${date}`;

    await interaction.editReply(setlistDisplay);

  } catch (error) {
    console.error("Error fetching show information:", error);
    await interaction.editReply("An error occurred while fetching the show information.");
  }
}

// Existing functions
// Check if the query is just a year
function isExactYear(str) {
  return /^\d{4}$/.test(str);
}

// Parse dates using chrono-node
function parseFlexibleDate(dateStr) {
  try {
    const results = chrono.parse(dateStr);

    if (results.length > 0) {
      return results[0].start.date();
    }

    return null;
  } catch (error) {
    console.error("Date parsing error:", error);
    return null;
  }
}

// Format a Date object to YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Handler functions
async function handleRandomShow(interaction) {
  await interaction.editReply("Playing a random show...");
  // Implementation to play random show
}

async function handleYearShow(interaction, year) {
  await interaction.editReply(`Playing a random show from ${year}...`);
  // Implementation to play a random show from that year
}

async function handleDateShow(interaction, date) {
  await interaction.editReply(`Playing show from ${date}...`);
  // Implementation to play show from specific date
}

async function handleSearch(interaction, query) {
  await interaction.editReply(`Searching for "${query}"...`);
  // Implementation to search and play based on query
}
