const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

const maximumIngredients = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('craft')
        .setDescription('Crafts a new item using ingredients. You can combine up to 5 ingredients.')
        .addStringOption(option =>
            option.setName('ingredients')
                .setDescription('List of ingredients separated by "+" or simply concatenated')
                .setRequired(true)),
    async execute(interaction) {
        const ingredientsInput = interaction.options.getString('ingredients');
        const ingredients = ingredientsInput.split(/ *\+ */).slice(0, maximumIngredients);

        if (ingredients.length < 2) {
            return interaction.reply({ content: 'Please provide at least two ingredients, separated by "+" or concatenated directly.', ephemeral: true });
        }

        try {
            let result = ingredients[0];
            let resultMessage = '';
            let emoji = '';

            for (let i = 0; i < ingredients.length - 1; i++) {
                const firstIngredient = result;
                const secondIngredient = ingredients[i + 1];

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
                    },
                    timeout: 15000
                });

                result = response.data.result;
                emoji = response.data.emoji;
                const isNewDiscovery = response.data.isNew;

                resultMessage += `${firstIngredient} + ${secondIngredient} = ${emoji} ${result} ${isNewDiscovery ? 'NEW!' : ''}\n`;
            }

            await interaction.reply({ content: resultMessage.trim() });
        } catch (error) {
            console.error('Error with crafting API:', error);
            await interaction.reply({ content: 'Failed to craft the items. Please try again later.', ephemeral: true });
        }
    }
}