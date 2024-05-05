const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('formalize')
        .setDescription('Rephrases the text with a specified tone and spiciness')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text to rephrase')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('conversion')
                .setDescription('The tone of the conversion')
                .setRequired(true)
                .addChoices(
                    { name: 'More professional', value: 'professional' },
                    { name: 'More polite', value: 'polite' },
                    { name: 'Less snarky', value: 'snarky' },
                    { name: 'Easier to read', value: 'readable' },
                    { name: 'More formal', value: 'formal' },
                    { name: 'More informal', value: 'informal' },
                    { name: 'More sociable (waffle)', value: 'sociable' },
                    { name: 'More concise (unwaffle)', value: 'concise' },
                    { name: 'Less emotional', value: 'Calm' },
                    { name: 'More passionate (waffle)', value: 'passionate' },
                    { name: 'More sarcastic', value: 'sarcastic' },
                    { name: 'Grammatically correct', value: 'grammatical' },
                    { name: 'Bullet points', value: 'bullets' },
                    { name: 'A single word (thesaurus mode)', value: 'thesaurus' },
                ))
        .addIntegerOption(option =>
            option.setName('spiciness')
                .setDescription('The level of spiciness (1-5)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(5)),
    async execute(interaction) {
        const text = interaction.options.getString('text');
        const conversion = interaction.options.getString('conversion');
        const spiciness = interaction.options.getInteger('spiciness');
        const spicinessIcons = ':hot_pepper:'.repeat(spiciness);

        try {
            const response = await axios.post('https://goblin.tools/api/Formalizer', {
                Text: text,
                Conversion: conversion,
                Spiciness: spiciness
            });

            const resultText = response.data;
            const embed = new EmbedBuilder()
                .setColor(0xA312ED)
                .setTitle('Text Formalization Result')
                .addFields(
                    { name: 'Original Text', value: text, inline: false },
                    { name: 'Formalized Text', value: resultText, inline: false },
                    { name: 'Tone', value: conversion, inline: true },
                    { name: 'Spiciness', value: spicinessIcons, inline: true }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error calling the Formalizer API:', error);
            await interaction.reply({ content: 'Failed to formalize the text. Please try again later.', ephemeral: true });
        }
    }
}