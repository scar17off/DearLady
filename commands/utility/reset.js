const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./botDatabase.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset your XP and level to zero'),
    async execute(interaction) {
        const user = interaction.user;
        const serverId = interaction.guild.id;

        db.run(`UPDATE user_xp SET xp = 0, level = 1 WHERE user_id = ? AND server_id = ?`, [user.id, serverId], (err) => {
            if (err) {
                return interaction.reply({ content: 'Failed to reset your data.', ephemeral: true });
            }
            interaction.reply({ content: 'Your XP and level have been reset to zero.', ephemeral: true });
        });
    }
}