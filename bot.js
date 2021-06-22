const discord = require("discord.js");

const client = new discord.Client();

const config = {
  token: process.env.BOT_TOKEN,
  prefix: '!' 
}

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("message", async message => {
  try {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;
  
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
       
    if (command === "ping") {
      const m = await message.channel.send("Ping?");
      m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
    }
  
    if (command === "shuffle-us") {

      if (!message.member.voice.channel) return message.reply('Please join a voice channel first!');

      const members = Array.from(message.member.voice.channel.members, ([_, guildMember]) => ({ value: guildMember.displayName }))

      let shuffledMembers = members;
      for (let i = members.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledMembers[i], shuffledMembers[j]] = [shuffledMembers[j], shuffledMembers[i]];
        shuffledMembers[i].name = `#${i + 1}`;
        shuffledMembers[j].name = `#${j + 1}`;
      }

      const embed = {
        color: 0x0099ff,
        fields: [...shuffledMembers]
      }

      return message.channel.send({ embed });
      

    }
  } catch (err) {
    console.log(JSON.stringify(err))
  }
  
});

client.login(config.token);