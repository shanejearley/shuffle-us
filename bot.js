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

client.on("debug", console.log)

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

      const members = message.member.voice.channel.members.map((member, index) => {
        return { name: `1. ${index + 1}`, value: member.username }
      });

      const embed = new discord.MessageEmbed()
        .setColor('#0099ff')
        .addFields(...members)

      return message.channel.send(embed);
      

    }
  } catch (err) {
    console.log(JSON.stringify(err))
  }
  
});

client.login(config.token);