let SERVERS = {};


module.exports = {
    args: false,
    name: "playlist",
    guildOnly: true,
    description: "Shows all songs currently in the server's queue.",

    execute(message, args){
        message.channel.send("Still learning this command. It may not function correctly.");

        const client = message.client;
        SERVERS = client.SERVERS;
        const serverID = message.guild.id;

        if(!SERVERS[serverID]){
            message.channel.send("Playlist is empty.");
            return;
        }

        songQueue = SERVERS[serverID].songQueue;

        if(!songQueue || !songQueue[0]){
            message.channel.send("Playlist is empty.");
            return;
        }

        for (let i = 0; i < songQueue.length; i++) {
            message.channel.send(`${i + 1}.  ${songQueue[i].title}`)
        }

    }
}