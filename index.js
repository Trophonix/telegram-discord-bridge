// Load config
const Files = require('fs');
const config = JSON.parse(Files.readFileSync('./config.json'));

// Discord bot setup
const Discord = require('discord.js');

const discord_bot = new Discord.Client();

var discord_channel;
discord_bot.on('ready', async () => {
    console.log('Logged into discord.');
    discord_bot.setActivity('2-way communication!')
    discord_channel = await discord_bot.channels.fetch(config.discord_channel_id);
});

// Telegram bot setup
const Telegram = require('node-telegram-bot-api');
const telegram_bot = new Telegram(config.telegram_token, {polling: true});

// Mirror messages
discord_bot.on('message', msg => {
    if (msg.author.id === discord_bot.user.id) return;
    if (msg.channel.id === config.discord_channel_id) {
        var name = msg.member.displayName || msg.user.username;
        telegram_bot.sendMessage(config.telegram_channel_id, `[${name}]: ${msg.cleanContent}`);
    }
});

telegram_bot.on('message', msg => {
    if (msg.via_bot) return;
    if (msg.chat.id === config.telegram_channel_id) {
        var user = msg.from;
        var name = user.first_name;
        if (user.last_name) name += ' ' + user.last_name;
        var text = msg.text;
        if (text.length > 1900) {
            text = text.substring(0, 1900);
            text += ' *'
        }
        discord_channel.send(`**${name}:** ${msg.text}`)
    }
});

// Activate
discord_bot.login(config.discord_token);
