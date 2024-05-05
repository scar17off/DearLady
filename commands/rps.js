const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, SelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock-Paper-Scissors game'),
    async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Choose your weapon')
                    .addOptions([
                        {
                            label: 'Rock 🪨',
                            description: 'Select Rock',
                            value: 'rock',
                        },
                        {
                            label: 'Paper 📄',
                            description: 'Select Paper',
                            value: 'paper',
                        },
                        {
                            label: 'Scissors ✂️',
                            description: 'Select Scissors',
                            value: 'scissors',
                        },
                    ]),
            );

        await interaction.reply({ content: 'Choose rock, paper, or scissors!', components: [row], ephemeral: true });

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'select') {
                const userChoice = i.values[0];
                const choices = ['rock', 'paper', 'scissors'];
                const botChoice = choices[Math.floor(Math.random() * choices.length)];
                const result = checkWinner(userChoice, botChoice);

                await i.update({ content: `You chose ${userChoice} 🆚 Bot chose ${botChoice}\n${result}`, components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'Game timed out! Please try again.', components: [] });
            }
        });

        function checkWinner(user, bot) {
            if (user === bot) {
                return "It's a tie! 🤝";
            } else if ((user === 'rock' && bot === 'scissors') || (user === 'paper' && bot === 'rock') || (user === 'scissors' && bot === 'paper')) {
                return "You win! 🎉";
            } else {
                return "You lose! 😢";
            }
        }
    }
}