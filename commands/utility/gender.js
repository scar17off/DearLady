const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./botDatabase.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gender')
        .setDescription('Set your gender')
        .addStringOption(option =>
            option.setName('gender')
                .setDescription('Your gender')
                .setRequired(true)
                .addChoices(
                    { name: 'Male ♂️', value: 'male' },
                    { name: 'Female ♀️', value: 'female' },
                    { name: 'Non-binary ⚧️', value: 'non-binary' }
                )),
    async execute(interaction) {
        const gender = interaction.options.getString('gender');
        const userId = interaction.user.id;

        db.get(`SELECT user_id FROM users WHERE user_id = ?`, [userId], (err, row) => {
            if (err) {
                return interaction.reply({ content: 'Database error.', ephemeral: true });
            }
            if (!row) {
                // Assuming username is required and should be fetched from interaction
                const username = interaction.user.username;
                db.run(`INSERT INTO users (user_id, gender) VALUES (?, ?)`, [userId, gender], (err) => {
                    if (err) {
                        console.error(err);
                        return interaction.reply({ content: 'Failed to add user to database.', ephemeral: true });
                    }
                    return interaction.reply({ content: 'User added and gender set successfully!', ephemeral: true });
                });
            } else {
                db.run(`UPDATE users SET gender = ? WHERE user_id = ?`, [gender, userId], (err) => {
                    if (err) {
                        console.error(err);
                        return interaction.reply({ content: 'Failed to update gender.', ephemeral: true });
                    }
                    return interaction.reply({ content: 'Gender updated successfully!', ephemeral: true });
                });
            }
        });
    }
}