const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const commands = require('./help.json').commands;
const categories = require("./help.json").categories;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays help information for commands'),
    async execute(interaction) {
        let page = 0;
        const commandsPerPage = 10;
        const categoryLabels = categories;
        const categoryKeys = Object.keys(categoryLabels);
        let currentCategory = categoryKeys[0];
        const filteredCommands = () => commands.filter(cmd => cmd.category === currentCategory);
        const totalPages = () => Math.ceil(filteredCommands().length / commandsPerPage);

        const embeds = () => {
            const pages = [];
            for (let i = 0; i < totalPages(); i++) {
                const embed = new EmbedBuilder()
                    .setColor(0xA312ED)
                    .setTitle(`Commands: ${currentCategory} (Page ${i + 1} of ${totalPages()})`)
                    .setDescription(filteredCommands().slice(i * commandsPerPage, (i + 1) * commandsPerPage)
                        .map(cmd => `**${cmd.usage}**\n${cmd.description}`).join('\n'))
                    .setFooter({ text: 'Use the buttons to navigate through the pages.' });
                pages.push(embed);
            }
            return pages;
        };

        const categoryButtons = new ActionRowBuilder()
            .addComponents(
                categoryKeys.map(category => 
                    new ButtonBuilder()
                        .setCustomId(`category_${category}`)
                        .setLabel(category)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(categoryLabels[category])
                )
            );

        const navigationButtons = () => new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === totalPages() - 1)
            );

        const message = await interaction.reply({ 
            embeds: [embeds()[0]], 
            components: [categoryButtons, navigationButtons()], 
            ephemeral: true, 
            fetchReply: true 
        });

        const collector = message.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'You cannot control this menu.', ephemeral: true });
            }

            const customId = i.customId;
            if (customId.startsWith('category_')) {
                currentCategory = customId.split('_')[1];
                page = 0; // Reset to first page
            } else {
                switch (customId) {
                    case 'previous':
                        page = page > 0 ? --page : totalPages() - 1;
                        break;
                    case 'next':
                        page = page + 1 < totalPages() ? ++page : 0;
                        break;
                }
            }

            await i.update({
                embeds: [embeds()[page]],
                components: [categoryButtons, navigationButtons()]
            });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('◀️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                );
            message.edit({ components: [disabledRow] });
        });
    }
}