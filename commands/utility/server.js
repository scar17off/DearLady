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
            .setTitle(server.name)
            .setDescription(`**General**\n` +
                `Owner: <@${server.ownerId}> (${server.ownerId})\n` +
                `ID: ${server.id}\n` +
                `Boosts: ${server.premiumSubscriptionCount}\n` +
                `Roles: ${server.roles.cache.size}\n` +
                `Verification: N/A\n` +
                `Created: ${server.createdAt.toDateString()}\n` +
                `**Channels**\n` +
                `Channels: ${server.channels.cache.size}\n` +
                `Text: ${server.channels.cache.filter(c => c.type === 'GUILD_TEXT').size}\n` +
                `Voice: ${server.channels.cache.filter(c => c.type === 'GUILD_VOICE').size}\n` +
                `Category: ${server.channels.cache.filter(c => c.type === 'GUILD_CATEGORY').size}\n` +
                `Forum: ${server.channels.cache.filter(c => c.type === 'GUILD_FORUM').size}\n` +
                `Stage: ${server.channels.cache.filter(c => c.type === 'GUILD_TRIBUNE').size}\n` +
                `Announcement: ${server.channels.cache.filter(c => c.type === 'GUILD_NEWS').size}\n` +
                `Thread: ${server.channels.cache.filter(c => c.isThread()).size}\n` +
                `**Members**\n` +
                `Total: ${server.memberCount}\n` +
                `Bots: ${server.members.cache.filter(m => m.user.bot).size}\n` +
                `Users: ${server.members.cache.filter(m => !m.user.bot).size}\n` +
                `Online: ${server.members.cache.filter(m => m.presence?.status === 'online').size}\n` +
                `DND: ${server.members.cache.filter(m => m.presence?.status === 'dnd').size}\n` +
                `Idle: ${server.members.cache.filter(m => m.presence?.status === 'idle').size}\n` +
                `Offline: ${server.members.cache.filter(m => m.presence?.status === 'offline').size}\n` +
                `**Other**\n` +
                `Emojis: ${server.emojis.cache.map(e => e.toString()).join(' ')}`)
            .setThumbnail(server.iconURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}