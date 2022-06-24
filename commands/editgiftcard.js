const { tebexSecret, giftcardperms } = require('../config').tebex;
const { default: axios } = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('editgiftcard')
        .setDescription('Edit the value of a giftcard')
        .addStringOption((option) => option.setName('code').setDescription('Code of gift card').setRequired(true))
        .addIntegerOption((option) => option.setName('amount').setDescription('Amount to topup').setRequired(true)),
    async execute(interaction) {
        async function codetoid(code) {
            const res = await axios({
                method: 'get',
                url: `https://plugin.tebex.io/gift-cards`,
                headers: { 'X-Tebex-Secret': tebexSecret },
            })
            try {
                return res.data.data.filter(i => i.code === code)[0].id;
            }
            catch {
                return null;
            }
        }

        const code = await codetoid(interaction.options.get('code').value)
        if(!code) return interaction.reply({ content: 'Couldn\'t find a gift card with that code!', ephemeral: true })

        const res = await axios({
            method: 'put',
            url: `https://plugin.tebex.io/gift-cards/${code}`,
            data: {
                amount: interaction.options.get('amount').value,
            },
            headers: { 'X-Tebex-Secret': tebexSecret },
        });

        interaction.reply({ content: `Successfully eddited the value of this card! New balance: \`${res.data.data.balance.remaining}\``, ephemeral: true })
        
    },
};