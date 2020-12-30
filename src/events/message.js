
const fs = require("fs");
const Discord = require("discord.js");

const { difficulty, firstLevel, min, max } = require("../config/leveling.json");

const getLevel = (xp) => {

    var level = 1;
    var needed = firstLevel;

    while (xp >= needed) {
        level++;
        needed = firstLevel * (difficulty * (level / 2)) * level;
    }

    return level;
}

const getRequiredXp = (level) => {
    return firstLevel * (difficulty * (level / 2)) * level;
}

const getPlace = (guildId, userId) => {

    var leveling;
    
    try {
        leveling = JSON.parse(fs.readFileSync("./src/data/leveling"));
    } catch (err) { return console.error(err) }

    var place = 0;
    var sharedPlaces = 0;

    if (leveling[guildId]) {
        const guildLevels = leveling[guildId];
        const userXp = leveling[guildId][userId];

        place = Object.values(guildLevels).length;
        

        Object.values(guildLevels).forEach(xp => {
            if (userXp >= xp) {
                if (userXp > xp) {
                    place--;
                } else {
                    sharedPlaces++;
                }
            }
        });
    }

    return {shared: sharedPlaces, place: place};
}

module.exports.event = "chatMessage";
module.exports.listener = msg => {

    getPlace(msg.guild.id)

    if (msg.channel.type != "text" || msg.author.bot) return;
    const client = msg.client;

    fs.readFile("./src/data/leveling", (err, data) => {
        if (err) return console.error(err);

        var leveling;

        try {
            leveling = JSON.parse(data.toString());
        } catch (err) { return console.error(err) };

        leveling[msg.guild.id] = leveling[msg.guild.id] || {};

        const userLevelData = leveling[msg.guild.id][msg.author.id] ? leveling[msg.guild.id][msg.author.id] : { xp: 0, lastSent: new Date(Date.now() - 9999999).getTime() };
        const lastSent = new Date(userLevelData.lastSent);
        lastSent.setMinutes(lastSent.getMinutes() + 1);
        if (Date.now() < lastSent) return;

        const randomXp = Math.floor(Math.random() * (max - min + 1)) + min;
        const totalXp = userLevelData.xp + randomXp;

        leveling[msg.guild.id][msg.author.id] = { xp: totalXp, lastSent: msg.createdAt.getTime() };

        fs.writeFile("./src/data/leveling", JSON.stringify(leveling), err => {
            if (err) return console.error(err);

            if (getLevel(totalXp) > getLevel(userLevelData.xp)) {
                const embed = new Discord.MessageEmbed({
                    color: "BLUE",
                    description: `:tada: <@!${msg.author.id}> is now at **level ${getLevel(totalXp)}**! This means that ${msg.member.displayName} is in place number **${getPlace(msg.guild.id, msg.author.id).place}**.`
                });

                msg.channel.send(embed);
            }
        });
    });
}