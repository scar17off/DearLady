const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
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
        if (interaction.options.getSubcommand() === 'mention') {
            const user = interaction.options.getUser('user');
            member = await interaction.guild.members.fetch(user.id);
        } else if (interaction.options.getSubcommand() === 'id') {
            const userId = interaction.options.getString('userid');
            member = await interaction.guild.members.fetch(userId);
        }
        
        if (!member) {
            db.close();
            return interaction.reply({ content: 'User not found.', ephemeral: true });
        }
        
        db.get(`SELECT birthday, gender FROM users WHERE user_id = ?`, [member.id], async (err, row) => {
            if (err) {
                db.close();
                return interaction.reply({ content: 'Failed to retrieve user data.', ephemeral: true });
            }
            
            const birthday = row && row.birthday ? new Date(row.birthday).toDateString() : 'N/A';
            const genderEmoji = row && row.gender === 'male' ? '♂️' : row && row.gender === 'female' ? '♀️' : row && row.gender === 'non-binary' ? '⚧️' : '❓';
            
            const embed = new EmbedBuilder()
                .setColor(0xA312ED)
                .setTitle(`User Information ${genderEmoji}`)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: 'Username', value: `${member.user.username}${member.user.discriminator !== '0' ? `#${member.user.discriminator}` : ''}`, inline: true },
                    { name: 'ID', value: member.user.id, inline: false },
                    { name: 'Created At', value: member.user.createdAt.toDateString(), inline: false },
                    { name: 'Joined At', value: member.joinedAt.toDateString(), inline: false },
                    { name: 'Birthday', value: birthday, inline: false },
                    { 
                        name: "Roles", 
                        value: member.roles.cache.filter(role => role.name !== '@everyone').map(role => `<@&${role.id}>`).join(', ') || 'N/A', 
                        inline: false 
                    },
                    { name: "Owner", value: member.guild.ownerId === member.id ? 'Yes' : 'No', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'User Info', iconURL: member.user.displayAvatarURL() });
    
            db.close();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        });
    }
}