const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('anfisa')
		.setDescription('Responds with a generated image of a female tabby cat.'),
	async execute(interaction) {
		const seed = Math.floor(Math.random() * 10000000) + 1;
		const imageUrl = `https://image.pollinations.ai/prompt/female%20cat,%20tabby%20type.?seed=${seed}`;
		
		try {
			const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
			const buffer = Buffer.from(response.data, 'binary');
			const attachment = new AttachmentBuilder(buffer, { name: 'anfisa-cat.png' });
			await interaction.reply({ files: [attachment] });
		} catch (error) {
			console.error('Failed to fetch the image:', error);
			await interaction.reply('Failed to fetch the image, please try again later.');
		}
	},
}