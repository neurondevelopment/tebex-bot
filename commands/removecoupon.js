const { tebexSecret, couponperms } = require('../config').tebex;
const { default: axios } = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removecoupon')
        .setDescription('Removes a new coupon')
        .addStringOption(option => option.setName('coupon').setDescription('The code of the coupon').setRequired(true)),
    async execute(interaction) {
        function checkUser(id) {
            let a = false;
            const user = interaction.guild.members.cache.get(id);
            const all = couponperms.split(',')
            all.forEach(curr => {
                if(user.roles.cache.find(r => r.id === curr) || !curr) {
                    a = true;
                }
            })
            return a;
        }

        if(checkUser(interaction.user.id) !== true) return interaction.reply({ content: 'You do not have permission to run this command!', ephemeral: true })
        
        async function codetoid(argss) {
            const r = await axios({
                method: 'get',
                url: `https://plugin.tebex.io/coupons`,
                headers: { 'X-Tebex-Secret': tebexSecret },
            })
            try {
                return r.data.data.filter(i => i.code === argss)[0].id;
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