const fetch = require('node-fetch');
const { TENOR_API_KEY } = require('../config');

module.exports = {
    args: false,
    arguments: "<keyword>",
    guildOnly: false,
    name: "gif",
    description: "Flurby gets a random GIF for you that matches a given keyword. If no keyword is given, he picks a family photo.",
    
    async execute(message, args){
        let searchTerm = (args.length > 0) ? args[0] : 'furby';
        let url = `https://api.tenor.com/v1/search?q=${searchTerm}&key=${TENOR_API_KEY}&limit=30&contentfilter=low`;
        let response = await fetch(url);
        let json = await response.json();
        message.channel.send(json.results[Math.floor(Math.random() * json.results.length)].url);
    }
}