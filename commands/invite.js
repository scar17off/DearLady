const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get an invite link to the creator\'s Discord server'),
    async execute(interaction) {
        const inviteLink = 'https://discord.gg/bn3cKzjrtq';
        await interaction.reply({ content: `Join the creator's server using this link: ${inviteLink}`, ephemeral: true });
    }
}