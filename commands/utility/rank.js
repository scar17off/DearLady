const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./botDatabase.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check XP and level of a user')
        .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const serverId = interaction.guild.id;

        db.get(`SELECT xp, level FROM user_xp WHERE user_id = ? AND server_id = ?`, [user.id, serverId], (err, row) => {
            if (err) {
                return interaction.reply({ content: 'Failed to retrieve user data.', ephemeral: true });
            }
            if (!row) {
                interaction.reply({ content: `${user.username} has no XP or level data in this server.`, ephemeral: true });
            } else {
                db.get(`SELECT initial_xp_for_level_up, xp_increment_per_level FROM servers WHERE server_id = ?`, [serverId], (err, config) => {
                    if (err) {
                        return interaction.reply({ content: 'Failed to retrieve server configuration.', ephemeral: true });
                    }
                    const nextLevelXp = config.initial_xp_for_level_up + row.level * config.xp_increment_per_level;
                    const xpDisplay = `${row.xp}/${nextLevelXp}`;
                    const progressBarLength = 10;
                    const xpSinceLastLevel = row.xp - (nextLevelXp - config.xp_increment_per_level);
                    const progressPercentage = Math.max(0, Math.floor((xpSinceLastLevel / config.xp_increment_per_level) * 100));
                    const progress = Math.max(0, Math.floor((xpSinceLastLevel / config.xp_increment_per_level) * progressBarLength));
                    const progressBar = ':blue_square:'.repeat(progress) + ':black_large_square:'.repeat(progressBarLength - progress);

                    const embed = new EmbedBuilder()
                        .setColor(0xA312ED)
                        .setTitle(`${user.username}'s XP and Level`)
                        .addFields(
                            { name: 'XP', value: xpDisplay, inline: true },
                            { name: 'Level', value: row.level.toString(), inline: true },
                            { name: `Progress (${progressPercentage}%)`, value: progressBar, inline: false }
                        );
                    interaction.reply({ embeds: [embed], ephemeral: true });
                });
            }
        });
    }
}