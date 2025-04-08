import { joinVoiceChannel, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Get the first guild
  const guild = client.guilds.cache.first();
  if (!guild) {
    console.error('No guilds found');
    return;
  }

  console.log(`Found guild: ${guild.name}`);

  // List all voice channels
  console.log('Available voice channels:');
  guild.channels.cache.forEach(channel => {
    if (channel.type === 2) { // 2 is the type for voice channels
      console.log(`- ${channel.name} (ID: ${channel.id})`);
    }
  });

  // Use the specific voice channel ID
  const voiceChannelId = '1358523743382540482';
  const voiceChannel = guild.channels.cache.get(voiceChannelId);

  if (!voiceChannel) {
    console.error(`Voice channel with ID ${voiceChannelId} not found`);
    return;
  }

  console.log(`Found voice channel: ${voiceChannel.name}`);

  // Join the voice channel
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator
  });

  console.log('Joined voice channel');

  // Create an audio player
  const player = createAudioPlayer({
    behaviors: {
      maxMissedFrames: 5,
      noSubscriber: 'pause'
    }
  });

  // Subscribe the player to the connection
  connection.subscribe(player);
  console.log('Player subscribed to connection');

  // Test URL - replace with a valid MP3 URL
  const testUrl = 'https://phish.in/blob/tnh56p8ttrkxdchnlm6q7hp60gus.mp3';

  console.log(`Testing audio playback with URL: ${testUrl}`);

  // Create an audio resource
  const resource = createAudioResource(testUrl, {
    inputType: 'arbitrary',
    inlineVolume: true
  });

  // Add event listeners
  player.on('stateChange', (oldState, newState) => {
    console.log(`Player state changed from ${oldState.status} to ${newState.status}`);
  });

  player.on('error', (error) => {
    console.error('Player error:', error);
  });

  // Play the resource
  player.play(resource);
  console.log('Started playing audio');

  // Keep the script running
  setTimeout(() => {
    console.log('Test completed');
    process.exit(0);
  }, 30000); // Run for 30 seconds
});

client.login(process.env.DISCORD_TOKEN);
