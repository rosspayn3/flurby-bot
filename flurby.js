const { Client, MessageEmbed } = require('discord.js');
const env = require('dotenv');
const path = require('path');
const fetch = require('node-fetch');


// Initialization and login

env.config({ path: path.resolve(__dirname, 'flurby.env') });
console.log("\nI'M ALIVE!! 🤖\n");
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(process.env.FLURBY_BOT_TOKEN);

const FLURBY_ID = process.env.FLURBY_ID;
let squidzorzUser = null;
const commandPrefix = "!";
const flurbyGames = [
    'Flurbyville 🌾',
    'Cyberpunk 2077 🤖',
    'Super Mario Party 🎉',
    'FFVII Remake 🌟',
    'FFVII ✨'
];








/*******************************************************************************/







/**
 * Things to do when Flurby logs in
 */
client.on('ready', async () => {
    console.log('I have arrived! 🎉\n');
    squidzorzUser = (await client.guilds.cache.get(process.env.TEAM_SERVER_ID).members.fetch(process.env.SQUIDZORZ_ID)).user;
    

    client.user.setActivity(flurbyGames[3], { type: 'PLAYING' })
            .then(presence => console.log(`Time to play my favorite game, ${presence.activities[0].name}`
                + "\n\n*************************************************\n\n"))
            .catch(console.error);

    setInterval( () => {
        let game = flurbyGames[ Math.floor(Math.random() * flurbyGames.length) ];
        client.user.setActivity(game, { type: 'PLAYING' })
            .then(presence => console.log(`Time to play my favorite game, ${presence.activities[0].name}`
                + "\n\n*************************************************\n\n"))
            .catch(console.error);
    }, 1000 * 60 * 5);

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
    channel.send(`Welcome to the server, ${member}`);
});




/*******************************************************************************/




/**
 * handle new messages
 */
client.on('message', (msg) => {

    // don't reply to yourself flurby
    if (msg.author === FLURBY_ID) {
        return;
    }

    if (msg.content.startsWith(commandPrefix)) {
        parseCommand(msg);
    }
    else if (msg.content.toLowerCase() === "hi flurby" && msg.author !== FLURBY_ID) {
        msg.react('🎉');
        let greeting = randomGreeting();
        msg.channel.send(`${greeting} ${msg.author}! 👋`);
    }
    else if (msg.content.toLowerCase() === 'lol' && msg.author !== FLURBY_ID) {
        replyToMessage(msg, "that wasn't even funny...");
    }

});

/**
 * Reply to a message
 */
function replyToMessage(msg, reply) {
    // console.log(`Replying to [${msg.author.username}]: ${msg.content}`)
    msg.reply(reply);
}

/**
 * Parse commands prefixed by "!"
 */
async function parseCommand(msg) {

    const args = msg.content.slice(commandPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    const paramString = args.join(' ');

    console.log(`Command from [${msg.author.username}]: "!${command} ${paramString}"`);

    switch (command) {

        case 'commands':
            const commandsEmbed = new MessageEmbed()
                .setTitle("Flurby Info @ rpayne.dev")
                .setAuthor(squidzorzUser.username, squidzorzUser.avatarURL())
                .setDescription("This is a list of commands Flurby can accept. It may change over time.")
                .setColor(0xE91E63)
                .setFooter("© Dec 2020 rpayne.dev", "https://rpayne.dev/img/logo.png")
                .setURL("https://rpayne.dev/projects/flurby/")
                .addField("!commands", "This is how you got here!")
                .addField("!8ball  [optional question]", "Shake ye olde 8-ball. You may not like Flurby's answer..." /*,true */)
                .addField("!gif  [optional keyword(s)]", "Flurby gets a random GIF for you.")
                .addField("Coming soon™", "More cool things to come whenever I have free time.");
            msg.channel.send(commandsEmbed);
            break;

        case '8ball':
            const answer = get8ballAnswer();
            msg.reply(answer);
            break;

        case 'gif':
            let searchTerm = (paramString.length > 0) ? paramString : 'furby';
            let url = `https://api.tenor.com/v1/search?q=${searchTerm}&key=${process.env.TENOR_KEY}&limit=30&contentfilter=low`;
            let response = await fetch(url);
            let json = await response.json();
            msg.channel.send(json.results[Math.floor(Math.random() * json.results.length)].url);
            break;

        default:
            console.log(`Invalid command: '!${command}'`);
            msg.channel.send('Uh. I dunno what you mean. To see available commands use \`!commands\`.');
            break;
    }

}

/**
 * Return a random awesome greeting
 */
function randomGreeting() {

    const greetings = [
        "Hello there",
        "Wassaaaaaaaaaaaaaaap",
        "What's goin on",
        "Allo",
        "Ayeeee",
        "Yo",
        "Sup",
        "HeyYyYyYy 😉 ",
        "What's crackin",
        "Ahoy there",
        "Howdy",
        "Que pasa",
        "Bonjour",
        "Konnichiwa",
        "Hai"
    ];

    const index = Math.floor(Math.random() * greetings.length);
    return greetings[index];

}

/**
 * Return a magic 8-ball answer
 */
function get8ballAnswer() {

    const answers = [
        "As I see it, yes.",
        "Ask again later.",
        "Better not tell you now.",
        "Cannot predict now.",
        "Concentrate and ask again.",
        "Don’t count on it.",
        "It is certain.",
        "It is decidedly so.",
        "Most likely.",
        "My reply is no.",
        "My sources say no.",
        "Outlook not so good.",
        "Outlook good.",
        "Reply hazy, try again.",
        "Signs point to yes.",
        "Very doubtful.",
        "Without a doubt.",
        "Yes.",
        "Yes – definitely.",
        "You may rely on it."
    ];

    const index = Math.floor(Math.random() * answers.length);
    return answers[index];

}




/*******************************************************************************/




/**
 * Handle new reactions
 */
client.on('messageReactionAdd', async (reaction, user) => {

    if (reaction.partial || reaction.message.partial) {
        console.log("Fetching reaction and its message...");
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
                .then(console.log(`[${member.user.username}] pinned message from [${message.author.username}] in channel [${message.channel.name}]`))
                .catch(console.error);
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
                .then(console.log(`[${member.user.username}] unpinned message from [${message.author.username}] in channel [${message.channel.name}]`))
                .catch(console.error);
        }

    }

}
