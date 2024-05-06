const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Displays information about the server.'),
    async execute(interaction) {
        const server = interaction.guild;
        const embed = new EmbedBuilder()
            .setColor(0xA312ED)
            .setTitle('Server Information')
            .addFields(
                { name: 'Server Name', value: server.name },
                { name: 'Total Members', value: server.memberCount.toString() },
                { name: 'Creation Date', value: server.createdAt.toDateString() },
                { name: 'Server ID', value: server.id }
            )
            .setThumbnail(server.iconURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}