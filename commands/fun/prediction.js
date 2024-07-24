const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prediction')
        .setDescription('Gives a random, cryptic prediction about your future.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to give the prediction to')
                .setRequired(false)),
    async execute(interaction) {
        const predictions = [
            "You will find a surprise under your bed tonight.",
            "Beware of the man in the red hat.",
            "A stranger will change your life forever.",
            "You will lose something valuable soon.",
            "Someone close to you is hiding a dark secret.",
            "You will dream of a place you've never been.",
            "A shadow will follow you for the next week.",
            "You will hear whispers in the wind.",
            "An old friend will bring bad news.",
            "You will find a mysterious note in your pocket.",
            "Your reflection will move on its own.",
            "You will see a face in the mirror that isn't yours.",
            "A black cat will cross your path.",
            "You will receive a message from beyond.",
            "You will feel a cold hand on your shoulder.",
            "A door will open by itself.",
            "You will hear footsteps behind you when you're alone.",
            "You will find an old photograph of someone you don't know.",
            "You will smell something burning with no source.",
            "You will hear your name whispered in the dark.",
            "You will see a figure in the corner of your eye.",
            "You will find a feather on your pillow.",
            "You will hear a knock on your door at midnight.",
            "You will feel like you're being watched.",
            "You will find a key with no lock.",
            "You will hear a child's laughter in an empty room.",
            "You will see a light in the attic.",
            "You will find a book with your name on it.",
            "You will hear music from an unknown source.",
            "You will see a shadow move on its own.",
            "You will find a doll with a missing eye.",
            "You will hear a phone ring with no one on the line.",
            "You will see a face in the window at night.",
            "You will find a note that says 'I'm watching you'.",
            "You will hear a scream in the distance.",
            "You will feel a presence in your room.",
            "You will find a handprint on your mirror.",
            "You will hear a door creak open by itself.",
            "You will see a figure standing at the end of your bed.",
            "You will find a lock of hair on your pillow.",
            "You will hear a whisper in your ear.",
            "You will see a pair of glowing eyes in the dark.",
            "You will find a footprint in your house.",
            "You will hear a voice calling your name.",
            "You will see a shadow pass by your window.",
            "You will find a note that says 'I'm here'.",
            "You will hear a knock on your window at night.",
            "You will see a figure in the fog.",
            "You will find a candle burning with no one around.",
            "You will hear a door slam shut by itself.",
            "You will see a face in the flames.",
            "You will find a message written in the dust."
        ];
        const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
        const user = interaction.options.getUser('user');
        const target = user ? user.username : 'You';
        await interaction.reply({ content: `${target}, ${randomPrediction}` });
    }
};