const discord = require("discord.js");
const speech = require('@google-cloud/speech');
const fs = require('fs');

const client = new discord.Client({ ws: { intents: ['GUILD_VOICE_STATES'] } });
const speechClient = new speech.SpeechClient();

const config = {
  token: process.env.BOT_TOKEN,
  prefix: '!' 
}

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("message", async message => {
  if(message.author.bot) return;
  if(!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
     
  if(command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  }

  if(command === "join") {
    if (!message.member.voice.channel) return message.reply('Please join a voice channel first!');
    if ((message.member.voice.channel.members.filter((e) => client.user.id === e.user.id).size > 0)) return message.reply(`I'm already in your voice channel!`);
    
    if (!message.member.voice.channel.joinable) return message.reply(`I don't have permission to join that voice channel!`);
    if (!message.member.voice.channel.speakable) return message.reply(`I don't have permission to speak in that voice channel!`);

    const connection = await message.member.voice.channel.join();
    await connection.play('ding.wav');

    connection.on('speaking', (user, speaking) => {
      if (!user) return;
      if (user.bot) return;
      if (!speaking) return;
      
      try {
        
        const audio = connection.receiver.createStream(user, { mode: 'pcm' });

        
        const audioFileName = '/recordings/' + user.id + '_' + Date.now() + '.pcm';
        
        audio.pipe(fs.createWriteStream(audioFileName));
        console.log('Streaming...')
        
        audio.on('end', async () => {
          console.log('Processing...')
          fs.stat(audioFileName, async (err, stat) => {
            if (!err && stat.size) {
              const file = fs.readFileSync(audioFileName);
              const audioBytes = file.toString('base64');
              const audio = {
                content: audioBytes,
              };
              const config = {
                encoding: 'LINEAR16',
                sampleRateHertz: 48000,
                languageCode: 'en-US',
                audioChannelCount: 2,
              };
              const request = {
                audio: audio,
                config: config,
              };
              console.log('Transcribing...')
              const [response] = await speechClient.recognize(request);
              const transcription = response.results
              .map(result => result.alternatives[0].transcript)
              .join('\n');
              console.log(`I think ${user.username} said ${transcription}`)
              message.reply(transcription);
            } else {
              console.log(JSON.stringify(err))
            }
          });
        });
      } catch (err) {
        console.log(JSON.stringify(err))
      }

    });
  }
  
});

client.login(config.token);