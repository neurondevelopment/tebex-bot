const { tebexSecret, couponperms } = require('../config').tebex;
const { default: axios } = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('removecoupon')
        .setDescription('Removes a new coupon')
        .addStringOption(option => option.setName('coupon').setDescription('The code of the coupon').setRequired(true)),
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

        const code = interaction.options.get('coupon').value
        const id = await codetoid(code)
        if(!id) return interaction.reply({ content: 'Couldn\'t find a coupon with that code!', ephemeral: true })

        await axios({
            method: 'delete',
            url: `https://plugin.tebex.io/coupons/${id}`,
            headers: { 'X-Tebex-Secret': tebexSecret },
        })

        interaction.reply({content: `Successfully deleted coupon \`${code}\``, ephemeral: true})

        
    },
};