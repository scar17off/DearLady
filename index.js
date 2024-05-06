const fs = require("fs");
const commandFiles = fs.readdirSync("./commands", { recursive: true }).filter(file => file.endsWith(".js"));
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./botDatabase.db');
const { Client, GatewayIntentBits, ActivityType, Events } = require("discord.js");
require("dotenv").config();
process.on('uncaughtException', error => console.error('Uncaught Exception:', error));
require("./setupDatabase.js");
const config = require("./config.json");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});
global.client = client;

const commands = new Map();
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(command.data.name, command);
}

function setActivity() {
    const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    client.user.setActivity(`over ${client.guilds.cache.size} servers and ${totalMembers} members`, { type: ActivityType.Watching });
}

client.on(Events.ClientReady, () => {
    console.log("Bot is ready");
    require("./server.js");
    setActivity();
    setInterval(setActivity, 600000); // 600000 milliseconds = 10 minutes
});

client.on(Events.MessageCreate, async message => {
    if (!message.author.bot && message.guild) {
        const random = Math.floor(Math.random() * 100) + 1;
        if (random <= config.xpGainChance) {
            const userId = message.author.id;
            const serverId = message.guild.id;

            db.get(`SELECT xp, level FROM user_xp WHERE user_id = ? AND server_id = ?`, [userId, serverId], (err, row) => {
                if (err) {
                    return console.error('Failed to retrieve user data:', err);
                }
                let newXp, newLevel;
                if (!row) {
                    newXp = 1;
                    newLevel = 1;
                    db.run(`INSERT INTO user_xp (user_id, server_id, xp, level) VALUES (?, ?, ?, ?)`, [userId, serverId, newXp, newLevel]);
                } else {
                    newXp = row.xp + 1;
                    const nextLevelXp = config.initialXpForLevelUp + row.level * config.xpIncrementPerLevel;
                    newLevel = newXp >= nextLevelXp ? row.level + 1 : row.level;
                    db.run(`UPDATE user_xp SET xp = ?, level = ? WHERE user_id = ? AND server_id = ?`, [newXp, newLevel, userId, serverId]);
                }
            });
        }
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    const command = commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(interaction);

        db.run(`INSERT INTO command_usage (command, count) VALUES (?, 1)
                ON CONFLICT(command) DO UPDATE SET count = count + 1 WHERE command = ?`, [commandName, commandName], function(err) {
            if (err) {
                return console.error('Database error:', err.message);
            }
        });

    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on(Events.GuildCreate, async guild => {
    db.run(`INSERT INTO servers (server_id, welcome_enabled, goodbye_enabled) VALUES (?, ?, ?)`, [
        guild.id,
        false,
        false
    ]);
});

client.login(process.env.token);