const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./botDatabase.db');
const categoryEmojis = require('./help.json').categories;
const commandCategories = require('./help.json').commands.reduce((acc, cmd) => {
    acc[cmd.usage.split(' ')[0].slice(1)] = cmd.category; // Extract command name and map to category
    return acc;
}, {});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Displays statistics')
        .addSubcommand(subcommand =>
            subcommand.setName('gender')
                .setDescription('Show statistics by gender'))
        .addSubcommand(subcommand =>
            subcommand.setName('commands')
                .setDescription('Show command usage statistics')),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'gender') {
            db.all(`SELECT gender, COUNT(gender) as count FROM users GROUP BY gender`, [], (err, rows) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Failed to retrieve statistics.', ephemeral: true });
                }
                if (rows.length === 0) {
                    return interaction.reply({ content: 'No gender data available.', ephemeral: true });
                }

                const total = rows.reduce((acc, row) => acc + row.count, 0);
                const genderStats = rows.map(row => {
                    const genderName = row.gender ? row.gender.charAt(0).toUpperCase() + row.gender.slice(1) : 'Unknown';
                    const genderIcon = row.gender === 'male' ? ' ♂️' : row.gender === 'female' ? ' ♀️' : row.gender === 'non-binary' ? ' ⚧️' : ' ❓';
                    return {
                        name: genderName + genderIcon,
                        value: `${row.count} (${((row.count / total) * 100).toFixed(2)}%)`,
                        inline: true
                    };
                }).sort((a, b) => b.value.localeCompare(a.value));

                const embed = new EmbedBuilder()
                    .setColor(0xA312ED)
                    .setTitle('Gender Statistics')
                    .addFields(genderStats)
                    .setFooter({ text: 'Use /gender to set your gender' });

                interaction.reply({ embeds: [embed], ephemeral: true });
            });
        } else if (interaction.options.getSubcommand() === 'commands') {
            db.all(`SELECT command, count FROM command_usage WHERE count > 0`, [], async (err, rows) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'Failed to retrieve command statistics.', ephemeral: true });
                }
                if (rows.length === 0) {
                    return interaction.reply({ content: 'No command usage data available.', ephemeral: true });
                }

                const categoryKeys = Object.keys(categoryEmojis);
                let currentCategory = categoryKeys[0];
                const filteredCommands = () => rows.filter(row => commandCategories[row.command] === currentCategory);
                let page = 0;
                const commandsPerPage = 10;
                const totalPages = () => Math.ceil(filteredCommands().length / commandsPerPage);

                const embeds = () => {
                    const pages = [];
                    for (let i = 0; i < totalPages(); i++) {
                        const commandDescriptions = filteredCommands().slice(i * commandsPerPage, (i + 1) * commandsPerPage).map(row => {
                            return `${row.command} - ${row.count} usages`;
                        }).join('\n');

                        const embed = new EmbedBuilder()
                            .setColor(0xA312ED)
                            .setTitle(`Command Usage Statistics: ${currentCategory} (Page ${i + 1} of ${totalPages()})`)
                            .setDescription(commandDescriptions);
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
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(categoryEmojis[category])
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
                        await i.update({
                            embeds: [embeds()[page]],
                            components: [categoryButtons, navigationButtons()]
                        });
                    } else {
                        switch (customId) {
                            case 'previous':
                                page = page > 0 ? --page : totalPages() - 1;
                                break;
                            case 'next':
                                page = page + 1 < totalPages() ? ++page : 0;
                                break;
                        }
                        await i.update({
                            embeds: [embeds()[page]],
                            components: [categoryButtons, navigationButtons()]
                        });
                    }
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
            });
        }
    }
}