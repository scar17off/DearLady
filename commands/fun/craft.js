const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('craft')
        .setDescription('Crafts a new item using two ingredients')
        .addStringOption(option =>
            option.setName('first')
                .setDescription('The first ingredient')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('second')
                .setDescription('The second ingredient')
                .setRequired(true)),
    async execute(interaction) {
        const firstIngredient = interaction.options.getString('first');
        const secondIngredient = interaction.options.getString('second');

        try {
            const response = await axios.get(`https://neal.fun/api/infinite-craft/pair`, {
                params: { first: firstIngredient, second: secondIngredient },
                headers: {
                    'sec-ch-ua': `"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"`,
                    'accept-language': 'ru,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,be;q=0.6',
                    'sec-ch-ua-mobile': '?0',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
                    'accept': '*/*',
                    'Referer': 'https://neal.fun/infinite-craft/',
                    'priority': 'u=1, i',
                    'sec-ch-ua-platform': '"Windows"'
                }
            });

            const result = response.data.result;
            const isNewDiscovery = response.data.isNew;
            const emoji = response.data.emoji;

            const embed = new EmbedBuilder()
                .setColor(0xA312ED)
                .setTitle('Crafting Result')
                .addFields(
                    { name: 'Result', value: `${firstIngredient} + ${secondIngredient} = ${emoji} ${result}`, inline: false },
                    { name: 'New discovery?', value: isNewDiscovery ? ':white_check_mark:' : ':negative_squared_cross_mark:', inline: false }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error with crafting API:', error);
            await interaction.reply({ content: 'Failed to craft the items. Please try again later.', ephemeral: true });
        }
    }
}