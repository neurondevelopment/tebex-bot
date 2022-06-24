const { tebexSecret, giftcardperms } = require('../config').tebex;
const { default: axios } = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('creategiftcard')
        .setDescription('Create a new giftcard')
        .addIntegerOption((option) => option.setName('amount').setDescription('Value of gift card').setRequired(true)),
    async execute(interaction) {
        const res = await axios({
            method: 'post',
            url: `https://plugin.tebex.io/gift-cards`,
            data: {
                amount: interaction.options.get('amount').value,
            },
            headers: { 'X-Tebex-Secret': tebexSecret },
        });

        interaction.reply({ content: `Successfully created card: \`${res.data.data.code}\``, ephemeral: true })
        
    },
};