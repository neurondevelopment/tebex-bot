const { tebexSecret, giftcardperms } = require('../config').tebex;
const { default: axios } = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('voidgiftcard')
        .setDescription('Voids (deletes) a gift card')
        .addStringOption((option) => option.setName('code').setDescription('Code of gift card').setRequired(true)),
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
        
        const id = await codetoid(interaction.options.get('code').value)
        if(!id) return interaction.reply({ content: 'Couldn\'t find a gift card with that code!', ephemeral: true })

        const res = await axios({
            method: 'delete',
            url: `https://plugin.tebex.io/gift-cards/${id}`,
            headers: { 'X-Tebex-Secret': tebexSecret },
        })

        if(res.data.data.void === true) {
            interaction.reply({ content: `Successfully voided card: \`${res.data.data.code}\``, ephemeral: true })
        }

        
    },
};