import { SlashCommandBuilder, MessageFlags } from "discord.js";

import handleHelp from "./help.js";
import handleShow from "./show.js";
import handlePlay from "./play.js";
import handlePause from "./pause.js";
import handleStop from "./stop.js";
import handleNextTrack from "./next.js";
import handlePreviousTrack from "./previous.js";
import handlePlaylist from "./playlist.js";
import handleAdd from "./add.js";
import handleRemove from "./remove.js";

const commandHandlers = {
  help: handleHelp,
  show: handleShow,
  play: handlePlay,
  pause: handlePause,
  stop: handleStop,
  next: handleNextTrack,
  previous: handlePreviousTrack,
  playlist: handlePlaylist,
  add: handleAdd,
  remove: handleRemove
};

export const data = new SlashCommandBuilder()
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
      .setDescription("Display setlist for a random show or specified date")
      .addStringOption(option =>
        option
          .setName("date")
          .setDescription("Show date in YYYY-MM-DD format (e.g., 1995-10-31)")
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("play")
      .setDescription("Play Phish content in your voice channel")
      .addStringOption(option =>
        option
          .setName("query")
          .setDescription("Date, year, song name, or venue")
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("pause")
      .setDescription("Pause playback")
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("stop")
      .setDescription("Stop playback and clear the playlist")
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("next")
      .setDescription("Skip to the next track in the playlist")
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("previous")
      .setDescription("Go back to the previous track in the playlist")
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("playlist")
      .setDescription("Show the current playlist")
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("add")
      .setDescription("Add tracks to the playlist")
      .addStringOption(option =>
        option
          .setName("query")
          .setDescription("Song name, date, venue, or Phish.in URL")
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("remove")
      .setDescription("Remove a track from the playlist by its number")
      .addIntegerOption(option =>
        option
          .setName("track_number")
          .setDescription("The track number to remove (1-based index)")
          .setRequired(true)
      )
  );

export async function execute(interaction, client) {
  const subcommand = interaction.options.getSubcommand();

  if (commandHandlers[subcommand]) {
    await commandHandlers[subcommand](interaction, client);
  } else {
    await interaction.reply({
      content: "Sorry, I don't understand",
      flags: MessageFlags.Ephemeral
    });
  }
}
