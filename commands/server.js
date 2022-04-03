require('dotenv').config();

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Replies with current server member count'),

    async execute(interaction) {
        const guild = interaction.client.guilds.cache.get(process.env.GUILD_ID);
        const memberCount = guild.memberCount;
        await interaction.reply(`WTPC Current Member Count: ${memberCount}`);
    },
};