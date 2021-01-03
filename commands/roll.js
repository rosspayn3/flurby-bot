const { MessageEmbed } = require('discord.js');
const Logger = require('../utils/logger');
const logger = new Logger();


module.exports = {
    args: false,
    arguments: "<top range> <number of dice>",
    guildOnly: false,
    name: "roll",
    description: "Rolls a number between 1-100 by default. If a number X is given, the roll will be up to and including that number (1 - X). Number of dice can also be specified as a second parameter.",

    async execute(message, args) {

        let embed = new MessageEmbed();
        embed.setColor(0xE91E63);
        embed.setTitle(`Roll for ${message.author.username}`);
        let dice = [];

        if(args.length > 0){
            // at least range given

            const range = args.shift();
            let numDice = 1;

            if(isNaN(range)){
                return message.reply('argument for range must be a number.');
            }

            if(args.length === 0){

                // number of dice not given, roll one time
                dice.push( { max: range, value: Math.floor(Math.random() * range) } );

            }
            else if(args.length === 1){

                // number of dice given, roll all the times
                numDice = args.shift();
                if(isNaN(numDice)){
                    return message.reply('argument for # dice must be a number.');
                }
                for (let i = 0; i < numDice; i++) {
                    dice.push( { max: range, value: Math.floor(Math.random() * range) } );
                }

            } else {

                // too many arguments
                return message.reply('You provided too many arguments.\nCorrect usage is \`!roll <top range> <number of dice>\`')

            }

        } else {

            // range not given. default roll.
            dice.push( { max: 100, value: Math.floor(Math.random() * 100) } );

        }

        dice.forEach(roll => {
            embed.addField(`1 - ${roll.max}`, `${roll.value}`, true);
        });

        message.channel.send(embed);
    }
}