const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ChannelType } = require('discord.js');

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
                `<:owner:1237138917669736448> Owner: <@${server.ownerId}> (${server.ownerId})\n` +
                `<:id:1237138915983364246> ID: ${server.id}\n` +
                `<:boost:1237142088747978762> Boosts: ${server.premiumSubscriptionCount}\n` +
                `<:roles:1237139992275324949> Roles: ${server.roles.cache.size}\n` +
                `<:verification:1237142088747978762> Verification: ${server.verificationLevel}\n` +
                `<:calendar:1237139891423285328> Created: ${server.createdAt.toDateString()}\n` +
                `**Channels**\n` +
                `<:channels:876782888762527232> Channels: ${server.channels.cache.size}\n` +
                `<:text:876782888762527232> Text: ${server.channels.cache.filter(c => c.type === ChannelType.GuildText).size}\n` +
                `<:voice:1237139781243240551> Voice: ${server.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size}\n` +
                `<:category:1237143092914819103> Category: ${server.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size}\n` +
                `<:forum:1237139992275324949> Forum: ${server.channels.cache.filter(c => c.type === ChannelType.GuildForum).size}\n` +
                `<:stage:876782888762527232> Stage: ${server.channels.cache.filter(c => c.type === ChannelType.GuildStageVoice).size}\n` +
                `<:announcement:1237142532899602563> Announcement: ${server.channels.cache.filter(c => c.type === ChannelType.GuildAnnouncement).size}\n` +
                `<:thread:876782888762527232> Thread: ${server.channels.cache.filter(c => c.isThread()).size}\n` +
                `**Members**\n` +
                `<:members:1237140291610214523> Total: ${server.memberCount}\n` +
                `<:bot:1237141118374772837> Bots: ${server.members.cache.filter(m => m.user.bot).size}\n` +
                `<:members:1237140291610214523> Users: ${server.members.cache.filter(m => !m.user.bot).size}\n` +
                `<:online:876782888762527232> Online: ${server.members.cache.filter(m => m.presence?.status === 'online').size}\n` +
                `<:dnd:876782888762527232> DND: ${server.members.cache.filter(m => m.presence?.status === 'dnd').size}\n` +
                `<:idle:876782888762527232> Idle: ${server.members.cache.filter(m => m.presence?.status === 'idle').size}\n` +
                `<:offline:876782888762527232> Offline: ${server.members.cache.filter(m => m.presence?.status === 'offline').size}\n` +
                `**Other**\n` +
                `<:emoji:1237140045786382446> Emojis: ${server.emojis.cache.map(e => e.toString()).join(' ')}`)
            .setThumbnail(server.iconURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}