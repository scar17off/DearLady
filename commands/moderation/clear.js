const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears a specified amount of messages')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The number of messages to clear')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('notify')
                .setDescription('Whether to send a notification message after clearing')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to clear messages.', ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'I do not have permission to clear messages in this channel.', ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');
        const notify = interaction.options.getBoolean('notify') || false;

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'You can only delete between 1 and 100 messages at a time.', ephemeral: true });
        }

        const messages = await interaction.channel.messages.fetch({ limit: amount });
        await interaction.channel.bulkDelete(messages, true);

        if (notify) {
            const notificationMessage = await interaction.followUp({ content: `${messages.size} messages have been cleared.`, ephemeral: true });
            setTimeout(() => notificationMessage.delete(), 5000);
        } else {
            await interaction.reply({ content: 'Messages cleared.', ephemeral: true });
        }
    }
}