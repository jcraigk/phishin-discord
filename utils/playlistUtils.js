import { joinVoiceChannel, createAudioPlayer } from "@discordjs/voice";

export function getOrCreatePlaylist(client, guildId, voiceChannel = null) {
  let playlist = client.playlists?.get(guildId);

  if (!playlist) {
    const player = voiceChannel ? createAudioPlayer() : null;
    const connection = voiceChannel ? joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator
    }) : null;

    if (connection && player) {
      connection.subscribe(player);
    }

    playlist = {
      tracks: [],
      player,
      connection,
      currentIndex: 0,
      isPaused: false,
      voiceChannelName: voiceChannel?.name || null
    };

    client.playlists = client.playlists || new Map();
    client.playlists.set(guildId, playlist);
  }

  return playlist;
}
