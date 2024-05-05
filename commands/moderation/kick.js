const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the server')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for kicking the user')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            const embed = new EmbedBuilder()
                .setColor(0xA312ED)
                .setDescription('You do not have permission to kick members.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            const embed = new EmbedBuilder()
                .setColor(0xA312ED)
                .setDescription('I do not have permission to kick members.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            const embed = new EmbedBuilder()
                .setColor(0xA312ED)
                .setDescription('User not found in the guild.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!member.kickable) {
            const embed = new EmbedBuilder()
                .setColor(0xA312ED)
                .setDescription('I cannot kick this user.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await member.kick(reason);
        const embed = new EmbedBuilder()
            .setColor(0xA312ED)
            .setDescription(`Successfully kicked ${user.tag} for reason: ${reason}`);
        interaction.reply({ embeds: [embed], ephemeral: true });
    }
}