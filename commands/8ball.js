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

module.exports = {
    args: false,
    arguments: "<question>",
    guildOnly: false,
    name: "8ball",
    description: "Shake ye olde 8-ball. You may not like Flurby's answer...",
    execute(message, args) {
        const i = Math.floor(Math.random() * answers.length);
        message.reply(answers[i]);
    }
}