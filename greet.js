function greet(message) {
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

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    message.channel.send( `${greeting} ${message.author}`).catch(err => console.log(err));
}

module.exports = { greet };