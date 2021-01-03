const ytdl = require('ytdl-core-discord');
const Logger = require('../utils/logger');
const logger = new Logger();

let SERVERS = {};

module.exports = {
    args: true,
    arguments: "<YouTube/YouTube Music URL>",
    guildOnly: true,
    permissions: 'SPEAK',
    name: "play",
    description: "Adds the URL to Flurby's playlist. If he's not already playing music, he joins your voice channel to play music. Only one channel can be used at a time.",
    
    async execute(message, args) {
        message.channel.send("Still learning this command. It may not function correctly.");

        const client = message.client;
        SERVERS = client.SERVERS;
        const serverID = message.guild.id;

        try {

             // add server to list if not found
            if (!SERVERS[serverID]) {
                // console.log(`Adding new server to server list [${serverID}]\n`);
                SERVERS[serverID] = {
                    songQueue: []
                }
            }

            const currentServer = SERVERS[serverID];
            const voiceChannel = message.member.voice.channel;

            // is the user in a voice channel
            if (!voiceChannel) {
                return message.reply("You must be in a voice channel to add a song.");
            }

            const permissions = voiceChannel.permissionsFor(client.user);
            // does the bot have permission to connect to voice channel and speak
            if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                return message.reply("I need the \`CONNECT\` and \`SPEAK\` permissions to play music in your voice channel!");
            }

            // link user provided
            const link = args[0].trim();
            // console.log(`Adding link to play queue:   [${link}]\n`);

            try {
                const songInfo = await ytdl.getInfo(link);
                const song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                };
                // console.log(`Adding song to queue: [${song.title}]\n`);
                currentServer.songQueue.push(song);
                message.channel.send(`Added song to queue: **[${song.title}]**`);
                logger.info(`Added song to queue: [${song.title}]`);
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


        } catch (error) {
            console.error(error);
        }
        


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

        const dispatcher = connection.play(await ytdl(song.url, { filter: "audioonly", highWaterMark: 1 << 25 }), { type: "opus" })
            .on("start", () => {
                message.channel.send(`Now playing: **[${song.title}]**`);
                logger.info(`Starting playback of [${song.title}]`);
            })
            .on("finish", () => {
                logger.info(`Finished playback of [${song.title}]`);
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
            .on("error", error => logger.error(error));

    } catch (error) {
        console.log("\n\n***** Something bad happened when attempting music playback *****\n\n");
        logger.error(error);
    }

}