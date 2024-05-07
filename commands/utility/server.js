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
                `├ <:owner:1237300483291353128> Owner: <@${server.ownerId}> (${server.ownerId})\n` +
                `├ <:id:1237300694017642517> ID: ${server.id}\n` +
                `├ <:boost:1237300801446350858> Boosts: ${server.premiumSubscriptionCount}\n` +
                `├ <:roles:1237300229431365663> Roles: ${server.roles.cache.size}\n` +
                `├ <:verification:1237300258585841706> Verification: ${server.verificationLevel}\n` +
                `└ <:calendar:1237300555685302303> Created: ${server.createdAt.toDateString()}\n` +
                `**Channels**\n` +
                `├ <:text:1237300390337187861> Channels: ${server.channels.cache.size}\n` +
                `├ <:text:1237300390337187861> Text: ${server.channels.cache.filter(c => c.type === ChannelType.GuildText).size}\n` +
                `├ <:voice:1237300348847263785> Voice: ${server.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size}\n` +
                `├ <:category:1237300454208045078> Category: ${server.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size}\n` +
                `├ <:forum:1237300079858028544> Forum: ${server.channels.cache.filter(c => c.type === ChannelType.GuildForum).size}\n` +
                `├ <:stage:1237300120840704031> Stage: ${server.channels.cache.filter(c => c.type === ChannelType.GuildStageVoice).size}\n` +
                `├ <:announcement:1237300197567238217> Announcement: ${server.channels.cache.filter(c => c.type === ChannelType.GuildAnnouncement).size}\n` +
                `└ <:thread:1237300164431974450> Thread: ${server.channels.cache.filter(c => c.isThread()).size}\n` +
                `**Members**\n` +
                `├  <:members:1237302366001434635> Total: ${server.memberCount}\n` +
                `├  <:bot:1237300593761189899> Bots: ${server.members.cache.filter(m => m.user.bot).size}\n` +
                `├  <:members:1237302366001434635> Users: ${server.members.cache.filter(m => !m.user.bot).size}\n` +
                `├  <:online:1237302550206877758> Online: ${server.members.cache.filter(m => m.presence?.status === 'online').size}\n` +
                `├  <:dnd:1237302449396650065> DND: ${server.members.cache.filter(m => m.presence?.status === 'dnd').size}\n` +
                `├  <:idle:1237302482984501308> Idle: ${server.members.cache.filter(m => m.presence?.status === 'idle').size}\n` +
                `└ <:offline:1237302517558411325> Offline: ${server.members.cache.filter(m => m.presence?.status === 'offline').size}\n` +
                `**Other**\n` +
                `└ <:status:1237361262439043072> Emojis: ${server.emojis.cache.map(e => e.toString()).join(' ')}`)
            .setThumbnail(server.iconURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}