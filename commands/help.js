import { MessageFlags } from "discord.js";

export default async function handleHelp(interaction) {
  await interaction.reply({
    content: "**Bot Commands:**\n\n" +
             "`/phishin help` - Show this help message\n" +
             "`/phishin show [date]` - Show info/setlist for a specific date\n" +
             "`/phishin play` - Play a random Phish show or resume paused playback\n" +
             "`/phishin play [query]` - Play based on your input:\n" +
             "  • Date (1995-10-31, Oct 31 1995, etc.): Play that specific show\n" +
             "  • Year (1997): Play a random show from that year\n" +
             "  • Song name (Tweezer): Play versions of that song\n" +
             "  • Venue name (Madison Square Garden): Play shows from that venue\n" +
             "`/phishin [stop|pause|next|previous]` - Control the current playback\n" +
             "**Note:** You must be in a voice channel to use the play commands.\n\n" +
             "API provided by `https://phish.in`",
    flags: MessageFlags.Ephemeral
  });
}
