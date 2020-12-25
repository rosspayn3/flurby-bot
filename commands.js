const { MessageEmbed } = require('discord.js');

const commands = [
    {
        name: "!commands",
        desc: "This is how you got here!"
    },
    {
        name: "!8ball  [optional question]",
        desc: "Shake ye olde 8-ball. You may not like Flurby's answer..."
    },
    {
        name: "!gif  [optional keyword(s)]",
        desc: "Flurby gets a random GIF for you. If no keyword is given, he picks a family photo."
    },
    {
        name: "!play  [YouTube URL]",
        desc: "Adds the URL to Flurby's playlist. If he's not already playing music, he joins your voice channel to play music. Only one channel can be used at a time. Also works with YouTube Music URLs."
    },
    {
        name: "!playlist",
        desc: "Shows all songs currently in the server's queue."
    },
    {
        name: "Coming soon™",
        desc: "More cool things to come whenever I have free time."
    }
]


let commandsEmbed = new MessageEmbed()
                    .setTitle("Flurby Info @ rpayne.dev")
                    .setAuthor("Ross Payne", "https://rpayne.dev/img/logo.png")
                    .setDescription("This is a list of commands Flurby can accept. It may change over time.")
                    .setColor(0xE91E63)
                    .setFooter("© Dec 2020 rpayne.dev", "https://rpayne.dev/img/logo.png")
                    .setURL("https://rpayne.dev/projects/flurby/");


commands.forEach(command => {
    // console.log(command);
    commandsEmbed.addField(command.name, command.desc);
});


module.exports = { commandsEmbed, commands };