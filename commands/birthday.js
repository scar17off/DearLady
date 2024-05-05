const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('Sets or gets a user\'s birthday')
        .addSubcommand(subcommand =>
            subcommand.setName('set')
                .setDescription('Set your birthday')
                .addStringOption(option => option.setName('date').setDescription('Your birthday in YYYY-MM-DD format').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('get')
                .setDescription('Get a user\'s birthday')
                .addUserOption(option => option.setName('user').setDescription('The user to get the birthday').setRequired(false))),
    async execute(interaction) {
        const db = new sqlite3.Database('./botDatabase.db');
        if (interaction.options.getSubcommand() === 'set') {
            const date = interaction.options.getString('date');
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date)) {
                return interaction.reply({ content: 'Invalid date format. Please use YYYY-MM-DD.', ephemeral: true });
            }
            db.run(`INSERT INTO users (user_id, username, birthday) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET birthday = ?`,
                [interaction.user.id, interaction.user.username, date, date],
                function(err) {
                    if (err) {
                        return interaction.reply({ content: 'Failed to set birthday.', ephemeral: true });
                    }
                    interaction.reply({ content: 'Birthday set successfully!', ephemeral: true });
                });
        } else {
            const user = interaction.options.getUser('user') || interaction.user;
            db.get(`SELECT birthday FROM users WHERE user_id = ?`, [user.id], (err, row) => {
                if (err) {
                    return interaction.reply({ content: 'Failed to retrieve birthday.', ephemeral: true });
                }
                if (row) {
                    interaction.reply({ content: `${user.username}'s birthday is on ${row.birthday}`, ephemeral: true });
                } else {
                    interaction.reply({ content: 'Birthday not set for this user.', ephemeral: true });
                }
            });
        }
        db.close();
    }
}