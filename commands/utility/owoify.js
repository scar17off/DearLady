const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('owoify')
		.setDescription('Owoifies your message!')
		.addStringOption(option =>
			option.setName('message')
				.setDescription('The message to owoify')
				.setRequired(true)),
	async execute(interaction) {
		const content = interaction.options.getString('message');
		const owoifiedMessage = content.replace(/r|l/g, 'w').replace(/R|L/g, 'W').replace(/n([aeiou])/g, 'ny$1').replace(/N([aeiou])/g, 'Ny$1').replace(/N([AEIOU])/g, 'Ny$1').replace(/ove/g, 'uv');
		await interaction.reply(owoifiedMessage);
	}
}