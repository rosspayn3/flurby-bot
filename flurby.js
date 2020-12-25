const { Client } = require('discord.js');
const env = require('dotenv');
const path = require('path');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core-discord');

const { commandsEmbed } = require('./commands');
const { type } = require('os');


// Initialization and login

env.config({ path: path.resolve(__dirname, 'flurby.env') });
console.log("\nI'M ALIVE!! 🤖\n");
const flurbyClient = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
flurbyClient.login(process.env.FLURBY_BOT_TOKEN);

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
let SERVERS = {};








/*******************************************************************************/







/**
 * Things to do when Flurby logs in
 */
flurbyClient.on('ready', async () => {
    console.log('I have arrived! 🎉\n');
    squidzorzUser = (await flurbyClient.guilds.cache.get(process.env.TEAM_SERVER_ID).members.fetch(process.env.SQUIDZORZ_ID)).user;
    // console.log(`Squidzorz = ${squidzorzUser}`);


    flurbyClient.user.setActivity(flurbyGames[3], { type: 'PLAYING' })
        .then(presence => console.log(
            "\n*************************************************\n\n"
            + `Time to play my favorite game, ${presence.activities[0].name}`
            + "\n\n*************************************************\n"))
        .catch(console.error);

    setInterval(() => {
        let game = flurbyGames[Math.floor(Math.random() * flurbyGames.length)];
        flurbyClient.user.setActivity(game, { type: 'PLAYING' })
            .then(presence => console.log(
                "\n*************************************************\n\n"
                + `Time to play my favorite game, ${presence.activities[0].name}`
                + "\n\n*************************************************\n"))
            .catch(console.error);
    }, 1000 * 60 * 10);

});




/*******************************************************************************/




/**
 * listen for new members
 */
flurbyClient.on('guildMemberAdd', member => {
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
flurbyClient.on('message', (message) => {

    // don't reply to yourself flurby
    if (message.author === FLURBY_ID) {
        return;
    }

    if (message.content.startsWith(commandPrefix)) {
        parseCommand(message);
    }
    else if (message.content.toLowerCase() === "hi flurby" && message.author !== FLURBY_ID) {
        message.react('🎉');
        let greeting = randomGreeting();
        message.channel.send(`${greeting} ${message.author}! 👋`);
    }
    else if (message.content.toLowerCase() === 'lol' && message.author !== FLURBY_ID) {
        replyToMessage(message, "that wasn't even funny...");
    }

});

/**
 * Reply to a message
 */
function replyToMessage(message, reply) {
    // console.log(`Replying to [${msg.author.username}]: ${msg.content}`)
    message.reply(reply);
}

/**
 * Parse commands prefixed by "!"
 */
async function parseCommand(message) {

    const args = message.content.slice(commandPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    const paramString = args.join(' ');

    console.log(`Command from [${message.author.username}]: "!${command} : ${paramString}"`);

    switch (command) {

        case 'commands':
            message.channel.send(commandsEmbed);
            break;

        case '8ball':
            const answer = get8ballAnswer();
            message.reply(answer);
            break;

        case 'gif':
            let searchTerm = (paramString.length > 0) ? paramString : 'furby';
            let url = `https://api.tenor.com/v1/search?q=${searchTerm}&key=${process.env.TENOR_KEY}&limit=30&contentfilter=low`;
            let response = await fetch(url);
            let json = await response.json();
            message.channel.send(json.results[Math.floor(Math.random() * json.results.length)].url);
            break;

        case 'play':

            const serverID = message.guild.id;
            if (!SERVERS[serverID]) {
                console.log(`Adding new server to server list [${serverID}]`);
                SERVERS[serverID] = {
                    songQueue: []
                }
            }

            const currentServer = SERVERS[serverID];
            const voiceChannel = message.member.voice.channel;

            // did user provide a link to a song
            if (!paramString.length > 0) {
                message.reply("I need a link to play music!")
                return;
            }

            // is the user in a voice channel
            if (!voiceChannel) {
                message.reply("You must be in a voice channel to add a song.");
                return;
            }

            const permissions = voiceChannel.permissionsFor(flurbyClient.user);
            // does the bot have permission to connect to voice channel and speak
            if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                message.reply("I need the permissions to join and speak in your voice channel!");
                return;
            }

            // link user provided
            const link = paramString.trim().split(' ')[0];
            // console.log(`Adding link to play queue: [${link}]\n`);

            try {
                const songInfo = await ytdl.getInfo(link);
                const song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                };
                currentServer.songQueue.push(song);
            } catch (error) {
                message.channel.send("Something went wrong when I tried to get the URL. Make sure it's valid. Playlist links don't work yet.");
                console.error(error);
            }

            // join voice channel and play links until queue is empty
            if (currentServer.songQueue.length == 1) {
                voiceChannel.join().then(connection => { play(connection, message) })
            } else {
                return;
            }


            break;

        case 'playlist':
            songQueue = SERVERS[message.guild.id].songQueue;

            if(!songQueue[0]){
                message.channel.send("Playlist is empty.");
                return;
            }
            for (let i = 0; i < songQueue.length; i++) {
                message.channel.send(`${i + 1}. ${songQueue[i].title}`)
            }

            break;

        default:

            console.log(`Invalid command: '!${command}'`);
            message.channel.send('Uh. I dunno what you mean. To see available commands use \`!commands\`.');
            break;
    }

}

async function play(connection, message) {

    let server = SERVERS[message.guild.id];
    let song = server.songQueue[0];

    try {

        /**
         * Need to figure out how to set volume on stream
         * 
         * options for ytdl
         *      highWaterMark: number of packets to have ready to stream (50 = 1 second of playback)
         */

        const dispatcher = connection.play(await ytdl(song.url, { highWaterMark: 1 << 25 }), { type: "opus" })
            .on("start", () => {
                message.channel.send(`Now playing: **[${song.title}]**`);
                console.log(`Starting playback of [${song.title}]`);
            })
            .on("finish", () => {
                console.log(`Finished playback of [${song.title}]`);
                // remove song from queue
                server.songQueue.shift();
                // if there are more songs in queue, keep playing. otherwise, disconnect.
                if (server.songQueue[0]) {
                    play(connection, message);
                } else {
                    console.log(`No more songs in queue. Leaving the voice channel.`);
                    connection.disconnect();
                }

            })
            .on("error", error => console.error(error));

    } catch (error) {
        console.log("\n\n***** something bad happened when attempting music playback *****\n\n");
        console.log(error);
    }


    // get next link in server queue and play it
    // server.dispatcher = connection.play( ytdl(server.songQueue[0], { type: "opus", volume: 0.75 }) );

    // server.dispatcher.on("start", () => {
    //     console.log(`Now playing [${server.songQueue[0]}]`);
    // })

    // remove song from queue
    // server.songQueue.shift();

    // on end of stream, play next link in queue, or disconnect if no more links
    // server.dispatcher.on("end", () => {
    //     if(server.songQueue[0]){
    //         play(connection, message);
    //     } else {
    //         connection.disconnect();
    //     }
    // });

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
flurbyClient.on('messageReactionAdd', async (reaction, user) => {

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
flurbyClient.on('messageReactionRemove', async (reaction, user) => {

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
