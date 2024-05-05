const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlocks the channel to allow others to send messages or add reactions.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: 'You do not have permission to unlock channels.', ephemeral: true });
        }

        const channel = interaction.channel;
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: true,
            AddReactions: true
        });

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🔓 Channel Unlocked')
            .setDescription(`This channel has been unlocked by ${interaction.user.tag}.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}