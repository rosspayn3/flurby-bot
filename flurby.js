const { Client, Collection } = require('discord.js');
const fs = require('fs');
const config = require('./config');
const { greet } = require('./greet');
const Logger = require('./utils/logger');
const { sleep } = require('./utils/sleep');


// instantiate Flurby client

const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const logger = new Logger();

// register all commands with client

client.commands = new Collection();

const commandFiles = fs.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));
console.log('\n');
logger.info(`Registering commands in client...`);
commandFiles.forEach(file => {
    try {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
        logger.success(`Registered command [${command.name}]`);
        sleep(200);
    } catch (error) {
        logger.error(error);
    }  
})
logger.info(`Finished.\n____________________________________________________________\n`);

// object for storing song queue for servers

client.SERVERS = {};


// Initialization and login

let squidzorzUser = null;
const commandPrefix = config.PREFIX;
const flurbyGames = [
    'Flurbyville 🌾',
    'Cyberpunk 2077 🤖',
    'Super Mario Party 🎉',
    'FFVII Remake 🌟',
    'FFVII ✨'
];

client.login(config.FLURBY_BOT_TOKEN);


/*******************************************************************************/







/**
 * Things to do when Flurby logs in
 */
client.on('ready', async () => {
    logger.success('I have logged in! 🎉');
    squidzorzUser = (await client.guilds.cache.get(config.TEAM_SERVER_ID).members.fetch(config.SQUIDZORZ_ID)).user;
    client.user.setActivity(flurbyGames[3], { type: 'PLAYING' }).catch(err => logger.error(err));
    
    // Flurby might get bored playing the same game all the time.
    // Every 10 minutes, he starts playing something else from his games list.
    setInterval(() => {
        let game = flurbyGames[Math.floor(Math.random() * flurbyGames.length)];
        client.user.setActivity(game, { type: 'PLAYING' }).catch(err => logger.error(err));
    }, 1000 * 60 * 10);

});




/*******************************************************************************/




/**
 * listen for new members
 */
client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.get('713225750618308639');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}!`);
});




/*******************************************************************************/



/**
 * handle new messages
 */
client.on('message', (message) => {

    // don't respond to Flurby or other bot messages.
    if (message.author.bot) {
        return;
    }

    if (message.content.startsWith(commandPrefix)) {
        parseCommand(message);
    }
    else if (message.content.toLowerCase() === "hi flurby") {
        message.react('🎉');
        greet(message);
    }
    else if (message.content.toLowerCase() === 'lol') {
        message.reply("That wasn't even funny...");
    }

});

/**
 * Parse commands
 */
async function parseCommand(message) {

    // remove prefix, trim whitespace, split on one or more spaces
    const args = message.content.slice(commandPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const paramString = args.join(" ");

    // console.log(`[${message.author.tag}]:  command: "${commandPrefix}${commandName}"   arguments: "${paramString}"`);

    if(!client.commands.has(commandName)){
        logger.error(`Unknown command : ${commandPrefix}${commandName}`);
        return message.channel.send("Wups. Unknown command. To see available commands use \`!commands\`.")
    }

    const command = client.commands.get(commandName);

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply("I can't execute that command inside DMs!");
    }

    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.client.user);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return message.reply("You don't have the necessary permissions do that! Contact a server admin to get permissions.");
        }
    }

    if(command.args && !args.length){
        let reply = `You must provide one or more arguments for this command.`;

        if(command.arguments){
            reply += `\nCorrect usage is: \`${commandPrefix}${command.name} ${command.arguments}\``;
        }

        return message.reply(reply);
    }

    try {
        command.execute(message, args);
    } catch (error) {
        logger.error(error);
        message.reply("Something went wrong executing that command...");
    }

}




/*******************************************************************************/




/**
 * Handle new reactions
 */
client.on('messageReactionAdd', async (reaction, user) => {

    if (reaction.partial || reaction.message.partial) {
        logger.info("Partial reaciton or message. Fetching...");
        await reaction.fetch();
        await reaction.message.fetch();
    }

    if (reaction.emoji.name === '📌' && reaction.message.pinnable) {
        pinMessage(reaction, user);
    }

    if (reaction.message.channel.id === '788875220441104394') {
        addMemberRole(reaction, user);
    }

});

function pinMessage(reaction, user) {

    const message = reaction.message;

    if (message.guild) {

        const member = message.guild.members.cache.find(member => member.id === user.id);

        if (member.hasPermission('MANAGE_MESSAGES')) {
            message.pin()
                .then(logger.info(`[${member.user.username}] pinned message from [${message.author.username}] in channel [${message.channel.name}]`))
                .catch(err => logger.error(err));
        }

    }

}

function addMemberRole(reaction, user) {

    const greenRole = '789449446974554112';
    const orangeRole = '789449500484698122';
    const yellowRole = '789449532680306728';

    const emoji = reaction.emoji.name;
    const member = reaction.message.guild.members.cache.find(member => member.id === user.id);

    switch (emoji) {

        case '🟢':
            console.log(`Adding member role: [${member.user.username}] - ${reaction.message.guild.roles.cache.get(greenRole).name}`)
            member.roles.add(greenRole);
            break;

        case '🟠':
            console.log(`Adding member role: [${member.user.username}] - ${reaction.message.guild.roles.cache.get(orangeRole).name}`)
            member.roles.add(orangeRole);
            break;

        case '🟡':
            console.log(`Adding member role: [${member.user.username}] - ${reaction.message.guild.roles.cache.get(yellowRole).name}`)
            member.roles.add(yellowRole);
            break;
    }

}



/*******************************************************************************/




/**
 * Handle removed reactions
 */
client.on('messageReactionRemove', async (reaction, user) => {

    if (reaction.partial || reaction.message.partial) {
        await reaction.fetch();
        await reaction.message.fetch();
    }

    if (reaction.emoji.name === '📌') {
        unpinMessage(reaction, user);
    }

});

function unpinMessage(reaction, user) {

    const message = reaction.message;

    if (message.guild) {

        const member = message.guild.members.cache.find(member => member.id === user.id);

        if (member.hasPermission('MANAGE_MESSAGES')) {
            message.unpin()
                .then(logger.info(`[${member.user.username}] unpinned message from [${message.author.username}] in channel [${message.channel.name}]`))
                .catch(err => logger.error(err));
        }

    }

}
