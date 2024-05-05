const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Locks the channel to prevent others from sending messages or adding reactions.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: 'You do not have permission to lock channels.', ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: 'I do not have permission to lock channels.', ephemeral: true });
        }

        const channel = interaction.channel;
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: false,
            AddReactions: false
        });

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🔒 Channel Locked')
            .setDescription(`This channel has been locked by ${interaction.user.tag}.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}