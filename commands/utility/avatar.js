const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Retrieve a user\'s avatar')
        .addSubcommand(subcommand =>
            subcommand.setName('mention')
                .setDescription('Get avatar by user mention')
                .addUserOption(option => option.setName('user').setDescription('The user to get the avatar').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('id')
                .setDescription('Get avatar by user ID')
                .addStringOption(option => option.setName('userid').setDescription('The user ID to get the avatar').setRequired(true))),
    async execute(interaction) {
        let user;
        if (interaction.options.getSubcommand() === 'mention') {
            user = interaction.options.getUser('user');
        } else if (interaction.options.getSubcommand() === 'id') {
            const userId = interaction.options.getString('userid');
            user = await interaction.client.users.fetch(userId).catch(() => null);
        }

        if (!user) {
            return interaction.reply({ content: 'User not found.', ephemeral: true });
        }

        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setImage(avatarUrl)
            .setColor(0xA312ED);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}