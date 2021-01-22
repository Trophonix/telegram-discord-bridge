// Load config
const Files = require('fs');
const config = JSON.parse(Files.readFileSync('./config.json'));

// Discord bot setup
const Discord = require('discord.js');

const discord_bot = new Discord.Client();

var discord_channel;
discord_bot.on('ready', async () => {
    console.log('Logged into discord.');
    await discord_bot.user.setActivity('2-way communication!')
    discord_channel = await discord_bot.channels.fetch(config.discord_channel_id);
});

// Telegram bot setup
const Telegram = require('node-telegram-bot-api');
const telegram_bot = new Telegram(config.telegram_token, {polling: true});

telegram_bot.on('polling_error', console.log);

// Mirror messages
var last_discord_name = '';
var last_telegram_name = '';

discord_bot.on('message', async msg => {
    if (msg.author.id === discord_bot.user.id) return;
    last_telegram_name = '';
    if (msg.cleanContent && msg.cleanContent.trim().length > 0 && msg.channel.id === config.discord_channel_id) {
        var name = msg.member.displayName || msg.user.username;
        if (last_discord_name !== name) {
            await telegram_bot.sendMessage(config.telegram_channel_id, `${name}`, { parse_mode: 'MarkdownV2' });
            last_discord_name = name;
        }
        await telegram_bot.sendMessage(config.telegram_channel_id, msg.cleanContent);
    }
});

telegram_bot.on('message', async msg => {
    if (msg.via_bot) return;
    last_discord_name = '';
    if (msg.chat && msg.text && msg.text.trim().length > 0 && msg.chat.id === config.telegram_channel_id) {
        var user = msg.from;
        var name = user.first_name;
        if (user.last_name) name += ' ' + user.last_name;
        if (last_telegram_name !== name) {
            await discord_channel.send(`**${name}**`);
            last_telegram_name = name;
        }
        var text = msg.text;
        if (text.length > 1900) {
            text = text.substr(0, 1900);
            text += '... This message was cut off due to message limits.'
        }
        var opt = {};
        if (msg.photo) {

        }
        discord_channel.send(`${msg.text}`);
    }
});

// Activate
discord_bot.login(config.discord_token);
