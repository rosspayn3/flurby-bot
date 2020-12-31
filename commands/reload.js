module.exports = {
	name: 'reload',
	description: 'Reloads a command',
	execute(message, args) {
		const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName);

        if (!command){
            return message.reply(`There is no command with name or alias \`${commandName}\`!`);
        }

        delete require.cache[require.resolve(`./${command.name}.js`)];

        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
            message.channel.send(`Successfully reloaded command \`${newCommand.name}\``)
            console.log(`Successfully reloaded command '${newCommand.name}'`);
        } catch (error) {
            console.error(error);
            message.channel.send(`Something bad happened while reloading the command \`${command.name}\`:\n\`${error.message}\``);
        }
	}
};