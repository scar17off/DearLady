const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('asparagus')
        .setDescription('Processes text with the Asparagus API')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text to process')
                .setRequired(true)),
    async execute(interaction) {
        const text = interaction.options.getString('text');

        try {
            const response = await axios.get('http://ma-kaka.ru/api/asparagus', {
                params: { text: text }
            });

            const resultText = response.data;
            const embed = new EmbedBuilder()
                .setColor(0xA312ED)
                .setTitle('Asparagus API Result')
                .addFields(
                    { name: 'Original Text', value: text, inline: false },
                    { name: 'Processed Text', value: resultText, inline: false }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error calling the Asparagus API:', error);
            await interaction.reply({ content: 'Failed to process the text. Please try again later.', ephemeral: true });
        }
    }
}