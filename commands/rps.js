const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock-Paper-Scissors game')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Choose a user to play with')
                .setRequired(false)),
    async execute(interaction) {
        const opponent = interaction.options.getUser('user');
        const isBot = !opponent;

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

        const gameMessage = isBot ? 'Choose rock, paper, or scissors!' : `You are playing against ${opponent.username}. Choose rock, paper, or scissors!`;
        const ephemeralStatus = isBot;

        await interaction.reply({ content: gameMessage, components: [row], ephemeral: ephemeralStatus });

        const filter = i => i.user.id === interaction.user.id || (opponent && i.user.id === opponent.id);
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

        const selections = {};

        collector.on('collect', async i => {
            if (i.customId === 'select') {
                selections[i.user.id] = i.values[0];
                await i.deferUpdate();

                if (selections[interaction.user.id] && !isBot) {
                    const opponentMessage = await interaction.followUp({ content: `Hey ${opponent.username}, it's your turn to choose rock, paper, or scissors!`, components: [row], ephemeral: false });
                }

                if (isBot || (selections[interaction.user.id] && selections[opponent.id])) {
                    const userChoice = selections[interaction.user.id];
                    const opponentChoice = isBot ? ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)] : selections[opponent.id];
                    const result = checkWinner(userChoice, opponentChoice);

                    const resultMessage = isBot ? 
                        `You chose ${userChoice} 🆚 Bot chose ${opponentChoice}\n${result}` :
                        `You chose ${userChoice} 🆚 ${opponent.username} chose ${opponentChoice}\n${result}`;

                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await interaction.editReply({ content: resultMessage, components: [] });
                    collector.stop();
                }
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'Game timed out! Please try again.', components: [] });
            }
        });

        function checkWinner(user, opponent) {
            if (user === opponent) {
                return "It's a tie! 🤝";
            } else if ((user === 'rock' && opponent === 'scissors') || (user === 'paper' && opponent === 'rock') || (user === 'scissors' && opponent === 'paper')) {
                return "You win! 🎉";
            } else {
                return "You lose! 😢";
            }
        }
    }
}