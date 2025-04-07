import { MessageFlags } from "discord.js";

export default async function handleHelp(interaction) {
  await interaction.reply({
    content:
      "`/phishin help` - Show this help message\n" +
      "`/phishin show [date]` - Show setlist for a specific date\n" +
      "`/phishin play [query]` - Play music based on your input (or random show if blank)\n" +
      "`/phishin [stop|pause|next|previous]` - Control playback\n" +
      "`/phishin playlist` - Show the current playlist\n" +
      "`/phishin add [query]` - Add track(s) to the playlist\n" +
      "`/phishin remove [track #]` - Remove a track from the playlist\n\n" +
      "**[query] can be:**\n" +
      "- Date (e.g., `1995-10-31`, `Oct 31 1995`): A specific show\n" +
      "- Year (e.g., `1997`): A random show from that year\n" +
      "- Song name (e.g., `Tweezer`): Random versions of that song\n" +
      "- Venue name (e.g., `MSG`): A random show from that venue\n" +
      "- URL (e.g., `https://phish.in/...`): A specific show, track, or playlist",
    flags: MessageFlags.Ephemeral
  });
}
