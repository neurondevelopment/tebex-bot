const { tebexSecret, giftcardperms } = require('../config').tebex;
const { default: axios } = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creategiftcard')
        .setDescription('Create a new giftcard')
        .addIntegerOption((option) => option.setName('amount').setDescription('Value of gift card').setRequired(true)),
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
        
        const r = await axios({
            method: 'post',
            url: `https://plugin.tebex.io/gift-cards`,
            data: {
                amount: interaction.options.get('amount').value,
            },
            headers: { 'X-Tebex-Secret': tebexSecret },
        });

        interaction.reply({ content: `Successfully created card: \`${r.data.data.code}\``, ephemeral: true })
        
    },
};