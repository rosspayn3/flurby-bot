const { MessageEmbed } = require('discord.js');
const path = require('path');
const fs = require('fs');
const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));

// don't add this file so it can be manually added as first command
// also throws error when trying to add itself so that's bad
const index = commandFiles.indexOf('commands.js');
if (index > -1) {
    commandFiles.splice(index, 1);
}

let commandsEmbed = new MessageEmbed()
                    .setTitle("Flurby Info @ rpayne.dev")
                    .setAuthor("Ross Payne", "https://rpayne.dev/img/logo.png")
                    .setDescription("This is a list of commands Flurby can accept. It may change over time.")
                    .setColor(0xE91E63)
                    .setFooter("© Dec 2020 rpayne.dev", "https://rpayne.dev/img/logo.png")
                    .setURL("https://rpayne.dev/projects/flurby/")
                    .addField("!commands", "This is how you got here!");

commandFiles.forEach(file => {
    const c = require(`./${file}`);
    if( c.name && !c.name.startsWith("commands") && !c.name.startsWith("reload")){
        if(c.hasOwnProperty('arguments')){
            if(c.args){
                commandsEmbed.addField(`!${c.name} ${c.arguments}`, c.description);
            } else {
                commandsEmbed.addField(`!${c.name} ${c.arguments} (optional)`, c.description);
            }
        } else {
            commandsEmbed.addField(`!${c.name}`, c.description);
        }
    }
})

commandsEmbed.addField("Coming Soon™", "More cool things to come whenever I have free time.");

module.exports = {
    args: false,
    guildOnly: false,
    name: 'commands',
    description: 'This is how you got here!',
    execute(message, args) {
        message.author.send(commandsEmbed);
    }
}