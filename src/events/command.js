
const Discord = require("discord.js");

const { prefix, developers, hiddenCategories } = require("../config/config.json");
const { botPrefixes } = require("../config/leveling.json");

module.exports.event = "message";
module.exports.listener = msg => {
    if (msg.channel.type != "text" || msg.author.bot) return;
    const client = msg.client;

    const args = msg.content.substr(prefix.length).toLowerCase().split(" ");
    const cmd = args.shift();

    if (client.commands.has(cmd)) {
        const cmdInfo = client.commands.get(cmd);
        var allowExecution = true;

        if (cmdInfo.permissions) {
            switch (cmdInfo.permissions) {
                case "kick":
                    allowExecution = msg.member.hasPermission("KICK_MEMBERS");
                    break;
                case "ban":
                    allowExecution = msg.member.hasPermission("BAN_MEMBERS");
                    break;
                case "admin":
                    allowExecution = msg.member.hasPermission("ADMINASTRATOR");
                    break;
                case "dev":
                    allowExecution = developers.includes(msg.author.id);
                    break;
            }
        }

        if (allowExecution) {
            cmdInfo.execute(msg, args);
        } else if (!hiddenCategories.includes(cmdInfo.category)) {
            const embed = new Discord.MessageEmbed({
                color: "RED",
                description: "You don't seem to have permissions to execute that command."
            });

            msg.channel.send(embed);
        }
    } else {
        if (!botPrefixes.some(val => msg.content.startsWith(val))) {
            client.emit("chatMessage", msg);
        }
    }
}