const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purges a specified number of messages from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose messages to purge')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The number of messages to purge')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to purge messages.', ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'I do not have permission to clear messages in this channel.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const number = interaction.options.getInteger('number');

        if (number < 1 || number > 100) {
            return interaction.reply({ content: 'You can only purge between 1 and 100 messages at a time.', ephemeral: true });
        }

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const userMessages = messages.filter(m => m.author.id === user.id).first(number);

        await interaction.channel.bulkDelete(userMessages, true);
        await interaction.reply({ content: `${userMessages.size} messages from ${user.tag} have been purged.`, ephemeral: true });
    }
}