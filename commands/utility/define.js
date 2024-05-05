const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('define')
        .setDescription('Finds the definition of a word')
        .addStringOption(option =>
            option.setName('word')
                .setDescription('The word to define')
                .setRequired(true)),
    async execute(interaction) {
        const word = interaction.options.getString('word');

        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

            if (response.data.length > 0 && response.data[0].meanings.length > 0) {
                const definitions = response.data[0].meanings.map(meaning => meaning.definitions.map(def => def.definition)).flat();
                const embed = new EmbedBuilder()
                    .setColor(0xA312ED)
                    .setTitle(`Definitions of ${word}`)
                    .setDescription(definitions.join('\n\n'));

                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply({ content: `No definitions found for the word: ${word}`, ephemeral: true });
            }
        } catch (error) {
            console.error('Error fetching definition:', error);
            await interaction.reply({ content: 'Failed to find the definition.', ephemeral: true });
        }
    }
}