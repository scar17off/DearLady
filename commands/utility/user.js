const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, time, TimestampStyles } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./botDatabase.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Displays information about a user')
        .addSubcommand(subcommand =>
            subcommand.setName('mention')
                .setDescription('Get user info by mention')
                .addUserOption(option => option.setName('user').setDescription('The user to get info').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('id')
                .setDescription('Get user info by user ID')
                .addStringOption(option => option.setName('userid').setDescription('The user ID to get info').setRequired(true))),
    async execute(interaction) {
        let member;
        try {
            if (interaction.options.getSubcommand() === 'mention') {
                const user = interaction.options.getUser('user');
                member = await interaction.guild.members.fetch(user.id);
            } else if (interaction.options.getSubcommand() === 'id') {
                const userId = interaction.options.getString('userid');
                member = await interaction.guild.members.fetch(userId);
            }

            if (!member) {
                return interaction.reply({ content: 'User not found in this guild.', ephemeral: true });
            }

            db.get(`SELECT birthday, gender FROM users WHERE user_id = ?`, [member.id], async (err, row) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Failed to retrieve user data.', ephemeral: true });
                }

                if (!row) {
                    // If no user data is found, create a new entry with default values
                    db.run(`INSERT INTO users (user_id, birthday, gender) VALUES (?, ?, ?)`, [member.id, null, 'undefined'], async (err) => {
                        if (err) {
                            console.error(err);
                            return interaction.reply({ content: 'Failed to create user data.', ephemeral: true });
                        }
                        // Continue to create the embed with default values
                        row = { birthday: null, gender: 'undefined' };
                        await sendUserEmbed(interaction, member, row);
                    });
                    return;
                }

                await sendUserEmbed(interaction, member, row);
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while fetching user data.', ephemeral: true });
        }
    }
}

async function sendUserEmbed(interaction, member, row) {
    const birthday = row.birthday ? new Date(row.birthday).toDateString() : 'N/A';
    const genderEmoji = {
        'male': '♂️',
        'female': '♀️',
        'non-binary': '⚧️'
    }[row.gender] || '❓';

    const embed = new EmbedBuilder()
        .setColor(0xA312ED)
        .setTitle(`User Information ${genderEmoji}`)
        .setThumbnail(member.user.displayAvatarURL())
        .setDescription(
            `**General**\n` +
            `├ <:members:1237302366001434635> Username: ${member.user.username}#${member.user.discriminator}\n` +
            `├ <:id:1237302366001434635> ID: ${member.user.id}\n` +
            `├ <:calendar:1237300555685302303> Created At: ${time(member.user.createdAt, TimestampStyles.LongDateTime)}\n` +
            `├ <:calendar:1237300555685302303> Joined At: ${time(member.joinedAt, TimestampStyles.LongDateTime)}\n` +
            `├ <:birthday:1237300622852886582> Birthday: ${birthday}\n` +
            `├ <:roles:1237300229431365663> Roles: ${member.roles.cache.filter(role => role.name !== '@everyone').map(role => `<@&${role.id}>`).join(', ') || 'N/A'}\n` +
            `└ <:owner:1237300483291353128> Owner: ${member.guild.ownerId === member.id ? 'Yes' : 'No'}`
        )
        .setTimestamp()
        .setFooter({ text: 'User Info', iconURL: member.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed], ephemeral: true });
}