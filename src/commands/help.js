
const Discord = require("discord.js");

const { hiddenCategories } = require("../config/config.json");

module.exports.name = "help";
module.exports.desc = "Shows the help menu.";
module.exports.category = "Info";
module.exports.example = "(command)";
module.exports.execute = (msg, args) => {

    const client = msg.client;
    const embed = new Discord.MessageEmbed({
        color: "GREEN",
        title: "Help",
        description: "Need more help? Join our [support server](https://discord.gg/76F5YwC4d3)."
    });

    client.commands.each((val, key) => {
        if (hiddenCategories.includes(val.category)) return;

        const cmdText = `\`${key}\` - ${val.desc}`;

        if (embed.fields.some(field => field.name == val.category)) {
            const fieldIndex = embed.fields.indexOf(embed.fields.find(field => field.name == val.category));
            const fieldText = embed.fields[fieldIndex].value;

            embed.spliceFields(fieldIndex, 1);
            embed.addField(val.category, `${fieldText}\n${cmdText}`);
        } else {
            embed.addField(val.category, cmdText);
        }
    });

    msg.channel.send(embed);

};