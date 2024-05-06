const fs = require("fs");
const commandFiles = fs.readdirSync("./commands", { recursive: true }).filter(file => file.endsWith(".js"));
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./botDatabase.db');
const { Client, GatewayIntentBits, ActivityType, Events } = require("discord.js");
require("dotenv").config();
process.on('uncaughtException', error => console.error('Uncaught Exception:', error));
require("./setupDatabase.js");

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
    const serverId = message.guild.id;
    db.get(`SELECT * FROM servers WHERE server_id = ?`, [serverId], (err, row) => {
        if (err) {
            console.error('Database error when checking server existence:', err);
        } else if (!row) {
            // If the server is not in the database, insert it with default values
            db.run(`INSERT INTO servers (server_id) VALUES (?)`, [serverId], (err) => {
                if (err) {
                    console.error('Database error when inserting new server:', err);
                } else {
                    console.log(`New server added to the database with ID: ${serverId}`);
                }
            });
        }
    });
    if (!message.author.bot && message.guild) {
        db.get(`SELECT xp_gain_chance, initial_xp_for_level_up, xp_increment_per_level FROM servers WHERE server_id = ?`, [serverId], (err, config) => {
            if (err) {
                return console.error('Failed to retrieve server config:', err);
            }
            if (!config) {
                return console.error('No config found for this server:', serverId);
            }
            const random = Math.floor(Math.random() * 100) + 1;
            if (random <= config.xp_gain_chance) {
                const userId = message.author.id;

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
                        const nextLevelXp = config.initial_xp_for_level_up + row.level * config.xp_increment_per_level;
                        newLevel = newXp >= nextLevelXp ? row.level + 1 : row.level;
                        db.run(`UPDATE user_xp SET xp = ?, level = ? WHERE user_id = ? AND server_id = ?`, [newXp, newLevel, userId, serverId]);
                    }
                });
            }
        });
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    const command = commands.get(commandName);
    if (!command) return;

    const serverId = interaction.guild.id;
    db.get(`SELECT * FROM servers WHERE server_id = ?`, [serverId], (err, row) => {
        if (err) {
            console.error('Database error when checking server existence:', err);
        } else if (!row) {
            // If the server is not in the database, insert it with default values
            db.run(`INSERT INTO servers (server_id) VALUES (?)`, [serverId], (err) => {
                if (err) {
                    console.error('Database error when inserting new server:', err);
                } else {
                    console.log(`New server added to the database with ID: ${serverId}`);
                }
            });
        }
    });

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
    db.run(`INSERT INTO servers (server_id) VALUES (?) ON CONFLICT(server_id) DO NOTHING`, [guild.id], (err) => {
        if (err) {
            console.error('Database error when inserting new server:', err);
        } else {
            console.log(`New server added or already exists in the database with ID: ${guild.id}`);
        }
    });
});

client.on(Events.GuildDelete, async guild => {
    db.run(`DELETE FROM servers WHERE server_id = ?`, [guild.id], (err) => {
        if (err) {
            console.error('Database error when deleting server:', err);
        } else {
            console.log(`Server with ID ${guild.id} removed from the database`);
        }
    });
});

client.login(process.env.token);