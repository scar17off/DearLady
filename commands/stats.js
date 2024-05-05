const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./botDatabase.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Displays statistics')
        .addSubcommand(subcommand =>
            subcommand.setName('gender')
                .setDescription('Show statistics by gender')),
    async execute(interaction) {
        db.all(`SELECT gender, COUNT(gender) as count FROM users GROUP BY gender`, [], (err, rows) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'Failed to retrieve statistics.', ephemeral: true });
            }
            if (rows.length === 0) {
                return interaction.reply({ content: 'No gender data available.', ephemeral: true });
            }

            const total = rows.reduce((acc, row) => acc + row.count, 0);
            const genderStats = rows.map(row => ({
                name: row.gender.charAt(0).toUpperCase() + row.gender.slice(1) + (row.gender === 'male' ? ' ♂️' : row.gender === 'female' ? ' ♀️' : row.gender === 'non-binary' ? ' ⚧️' : ' ❓'),
                value: `${row.count} (${((row.count / total) * 100).toFixed(2)}%)`,
                inline: true
            })).sort((a, b) => b.value.localeCompare(a.value));

            const embed = new EmbedBuilder()
                .setColor(0xA312ED)
                .setTitle('Gender Statistics')
                .addFields(genderStats)
                .setFooter({ text: 'Use /gender to set your gender' });

            db.close();
            interaction.reply({ embeds: [embed], ephemeral: true });
        });
    }
}