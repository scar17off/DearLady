const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls a dice with a specified number of sides')
        .addIntegerOption(option => 
            option.setName('sides')
                .setDescription('Number of sides on the dice')
                .setRequired(false)),
    async execute(interaction) {
        let sides = interaction.options.getInteger('sides');
        if (!sides || sides < 1) {
            sides = 6; // Default to a standard 6-sided dice
        }
        const roll = Math.floor(Math.random() * sides) + 1;
        await interaction.reply({ content: `You rolled a ${roll} on a ${sides}-sided dice.`, ephemeral: true });
    }
}