const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./botDatabase.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Manage XP for a user')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add XP to a user')
                .addUserOption(option => option.setName('user').setDescription('The user to add XP to').setRequired(true))
                .addIntegerOption(option => option.setName('amount').setDescription('Amount of XP to add').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove XP from a user')
                .addUserOption(option => option.setName('user').setDescription('The user to remove XP from').setRequired(true))
                .addIntegerOption(option => option.setName('amount').setDescription('Amount of XP to remove').setRequired(true))
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const serverId = interaction.guild.id;
        const action = interaction.options.getSubcommand();

        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'You do not have permission to manage XP.', ephemeral: true });
        }

        db.get(`SELECT xp, level FROM user_xp WHERE user_id = ? AND server_id = ?`, [user.id, serverId], (err, row) => {
            if (err) {
                db.close();
                return interaction.reply({ content: 'Failed to retrieve user data.', ephemeral: true });
            }
            db.get(`SELECT initial_xp_for_level_up, xp_increment_per_level FROM servers WHERE server_id = ?`, [serverId], (err, config) => {
                if (err) {
                    db.close();
                    return interaction.reply({ content: 'Failed to retrieve server configuration.', ephemeral: true });
                }
                if (!row) {
                    if (action === 'add') {
                        db.run(`INSERT INTO user_xp (user_id, server_id, xp, level) VALUES (?, ?, ?, ?)`, [user.id, serverId, amount, 1]);
                    } else {
                        interaction.reply({ content: `No XP to remove from ${user.username}.`, ephemeral: true });
                    }
                } else {
                    let newXp = action === 'add' ? row.xp + amount : row.xp - amount;
                    let newLevel = row.level;
                    if (newXp < 0) newXp = 0; // Prevent negative XP

                    let nextLevelXp = config.initial_xp_for_level_up + newLevel * config.xp_increment_per_level;

                    if (action === 'add') {
                        while (newXp >= nextLevelXp) {
                            newXp -= nextLevelXp;
                            newLevel++;
                            nextLevelXp = config.initial_xp_for_level_up + newLevel * config.xp_increment_per_level;
                        }
                    } else {
                        while (newXp < config.initial_xp_for_level_up && newLevel > 1) {
                            newLevel--;
                            newXp += config.initial_xp_for_level_up + (newLevel - 1) * config.xp_increment_per_level;
                        }
                    }

                    db.run(`UPDATE user_xp SET xp = ?, level = ? WHERE user_id = ? AND server_id = ?`, [newXp, newLevel, user.id, serverId]);
                }
                db.close();
                interaction.reply({ content: `${action === 'add' ? 'Added' : 'Removed'} ${amount} XP ${action === 'add' ? 'to' : 'from'} ${user.username} and updated their level accordingly.`, ephemeral: true });
            });
        });
    }
}