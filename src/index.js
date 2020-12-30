
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();


const token = fs.readFileSync("./src/config/token", { encoding: "utf8" });
client.commands = new Discord.Collection();

fs.readdirSync("./src/commands/").forEach(filename => {
    const pull = require(`./commands/${filename}`);

    client.commands.set(pull.name, pull);
});

fs.readdirSync("./src/events/").forEach(filename => {
    const pull = require(`./events/${filename}`);

    client.on(pull.event, pull.listener);
});

client.login(token);