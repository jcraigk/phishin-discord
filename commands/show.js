import { parseFlexibleDate, formatDate } from "../utils/dateUtils.js";
import { getRandomShow } from "../services/phishinAPI.js";

export default async function handleShow(interaction) {
  const dateInput = interaction.options.getString("date");

  await interaction.deferReply();

  const parsedDate = parseFlexibleDate(dateInput);

  if (!parsedDate) {
    await interaction.editReply(`Could not recognize "${dateInput}" as a valid date. Please use YYYY-MM-DD format.`);
    return;
  }

  const formattedDate = formatDate(parsedDate);

  try {
    const show = await phishinAPI.getShowByDate(formattedDate);
    const showData = show.data;

    let setlistDisplay = `**${showData.date}** - ${showData.venue_name}, ${showData.location}\n\n`;

    const setMap = {};

    showData.tracks.forEach(track => {
      if (!setMap[track.set]) {
        setMap[track.set] = [];
      }
      setMap[track.set].push(track);
    });

    Object.keys(setMap).sort().forEach(setName => {
      const tracks = setMap[setName];
      let formattedSetName = setName;

      if (setName.toLowerCase() === "e") {
        formattedSetName = "Encore";
      } else if (setName.match(/^set\s*\d+$/i)) {
        formattedSetName = "Set " + setName.replace(/^set\s*(\d+)$/i, "$1");
      }

      setlistDisplay += `**${formattedSetName}:**\n`;

      tracks.forEach((track, index) => {
        let trackDisplay = `${index + 1}. ${track.title}`;

        if (track.duration) {
          const minutes = Math.floor(track.duration / 60);
          const seconds = track.duration % 60;
          trackDisplay += ` (${minutes}:${seconds.toString().padStart(2, "0")})`;
        }

        setlistDisplay += `${trackDisplay}\n`;
      });

      setlistDisplay += "\n";
    });

    setlistDisplay += `\nListen: https://phish.in/${formattedDate}`;

    await interaction.editReply(setlistDisplay);

  } catch (error) {
    console.error("Error fetching show information:", error);
    await interaction.editReply("An error occurred while fetching the show information.");
  }
}
