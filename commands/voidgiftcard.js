const { tebexSecret, giftcardperms } = require('../config').tebex;
const { default: axios } = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voidgiftcard')
        .setDescription('Voids (deletes) a gift card')
        .addStringOption((option) => option.setName('code').setDescription('Code of gift card').setRequired(true)),
    async execute(interaction) {
        function checkUser(id) {
            let a = false;
            const user = interaction.guild.members.cache.get(id);
            const all = giftcardperms.split(',')
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
                url: `https://plugin.tebex.io/gift-cards`,
                headers: { 'X-Tebex-Secret': tebexSecret },
            })
            try {
                return r.data.data.filter(i => i.code === argss)[0].id;
            }
            catch {
                return null;
            }
        }
        
        const id = await codetoid(interaction.options.get('code').value)
        if(!id) return interaction.reply({ content: 'Couldn\'t find a gift card with that code!', ephemeral: true })

        const r = await axios({
            method: 'delete',
            url: `https://plugin.tebex.io/gift-cards/${id}`,
            headers: { 'X-Tebex-Secret': tebexSecret },
        })

        if(r.data.data.void === true) {
            interaction.reply({ content: `Successfully voided card: \`${r.data.data.code}\``, ephemeral: true })
        }

        
    },
};