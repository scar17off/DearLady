const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('porfirevich')
        .setDescription('Generate text continuation using the Porfirevich API')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('The text prompt to continue')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('model')
                .setDescription('The model to use (xlarge, gpt3, or frida)')
                .setRequired(false)
                .addChoices(
                    { name: 'xlarge', value: 'xlarge' },
                    { name: 'gpt3', value: 'gpt3' },
                    { name: 'frida', value: 'frida' }
                ))
        .addIntegerOption(option =>
            option.setName('length')
                .setDescription('The length of the continuation')
                .setRequired(false)),
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const model = interaction.options.getString('model') || 'xlarge';
        const length = interaction.options.getInteger('length') || 30;

        const requestBody = {
            prompt: prompt,
            model: model,
            length: length
        }

        try {
            const response = await axios.post('https://api.porfirevich.com/generate/', requestBody);
            const replies = response.data.replies;

            if (!replies || replies.length === 0) {
                throw new Error('No replies received from the API.');
            }

            const embed = new EmbedBuilder()
                .setColor(0xA312ED)
                .setTitle('Generated Continuations')
                .addFields(
                    replies.map((reply, index) => ({ name: `Continuation #${index + 1}`, value: `${prompt} ${reply}` }))
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error calling Porfirevich API:', error);
            await interaction.reply({ content: 'Failed to generate text. Please try again later.', ephemeral: true });
        }
    }
}