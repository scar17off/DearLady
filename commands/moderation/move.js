const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move a user to a different voice channel')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.MoveMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to move')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('voice_channel')
                .setDescription('The voice channel to move the user to')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            return interaction.reply({ content: 'You do not have permission to move members.', ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            return interaction.reply({ content: 'I do not have permission to move members.', ephemeral: true });
        }

        const user = interaction.options.getMember('user');
        const voiceChannel = interaction.options.getChannel('voice_channel');

        if (!user.voice.channel) {
            return interaction.reply({ content: 'The specified user is not in any voice channel.', ephemeral: true });
        }

        if (user.voice.channel.id === voiceChannel.id) {
            return interaction.reply({ content: 'The user is already in the specified voice channel.', ephemeral: true });
        }

        try {
            await user.voice.setChannel(voiceChannel);
            interaction.reply({ content: `Moved ${user.displayName} to ${voiceChannel.name}.`, ephemeral: false });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Failed to move the user.', ephemeral: true });
        }
    }
}