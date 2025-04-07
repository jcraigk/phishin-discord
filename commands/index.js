import { SlashCommandBuilder } from "discord.js";

import handleHelp from "./help.js";
import handlePause from "./pause.js";
import handlePlay from "./play.js";
import handleShow from "./show.js";
import handleStop from "./stop.js";
import handleNextTrack from "./next.js";
import handlePreviousTrack from "./previous.js";

const commandHandlers = {
  help: handleHelp,
  pause: handlePause,
  play: handlePlay,
  show: handleShow,
  stop: handleStop,
  next: handleNextTrack,
  previous: handlePreviousTrack,
  prev: handlePreviousTrack
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
      .setDescription("Play Phish content")
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
  );

export async function execute(interaction, client) {
  const subcommand = interaction.options.getSubcommand();

  if (commandHandlers[subcommand]) {
    await commandHandlers[subcommand](interaction, client);
  } else {
    await interaction.reply({
      content: "Sorry, I don't understand",
      ephemeral: true
    });
  }
}
