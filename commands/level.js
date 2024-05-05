const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./botDatabase.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Manage level for a user')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add levels to a user')
                .addUserOption(option => option.setName('user').setDescription('The user to add levels to').setRequired(true))
                .addIntegerOption(option => option.setName('amount').setDescription('Number of levels to add').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove levels from a user')
                .addUserOption(option => option.setName('user').setDescription('The user to remove levels from').setRequired(true))
                .addIntegerOption(option => option.setName('amount').setDescription('Number of levels to remove').setRequired(true))
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const serverId = interaction.guild.id;
        const action = interaction.options.getSubcommand();

        db.get(`SELECT level FROM user_xp WHERE user_id = ? AND server_id = ?`, [user.id, serverId], (err, row) => {
            if (err) {
                db.close();
                return interaction.reply({ content: 'Failed to retrieve user data.', ephemeral: true });
            }
            if (!row) {
                if (action === 'add') {
                    db.run(`INSERT INTO user_xp (user_id, server_id, xp, level) VALUES (?, ?, 0, ?)`, [user.id, serverId, amount]);
                } else {
                    interaction.reply({ content: `No levels to remove from ${user.username}.`, ephemeral: true });
                }
            } else {
                let newLevel = action === 'add' ? row.level + amount : row.level - amount;
                if (newLevel < 1) newLevel = 1;  Prevent level going below 1

                db.run(`UPDATE user_xp SET level = ? WHERE user_id = ? AND server_id = ?`, [newLevel, user.id, serverId]);
            }
            db.close();
            interaction.reply({ content: `${action === 'add' ? 'Added' : 'Removed'} ${amount} levels ${action === 'add' ? 'to' : 'from'} ${user.username}.`, ephemeral: true });
        });
    }
}