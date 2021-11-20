const { tebexSecret, embedColour } = require('../config').tebex;
const { dateformat, footer } = require('../config')
const Discord = require('discord.js')
const { default: axios } = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lookupgiftcard')
        .setDescription('Check the value of a giftcard')
        .addStringOption((option) => option.setName('code').setDescription('Code of gift card').setRequired(true)),
    async execute(interaction) {
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
            method: 'get',
            url: `https://plugin.tebex.io/gift-cards/${id}`,
            headers: { 'X-Tebex-Secret': tebexSecret },
        });

        const date = new Date(Date.parse(r.data.data.created_at))

        const ecreatedat = moment(`${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`, 'DD/MM/YYYY')
        const createdat = moment(ecreatedat).format(dateformat)

        const embed = new Discord.MessageEmbed()
            .setColor(embedColour)
            .setThumbnail(interaction.guild.iconURL())
            .addField('Created', `\`${createdat}\``, true)
            .addField('Valid', r.data.data.void ? '`False`' : '`True`', true)
            .addField('Code', `\`${interaction.options.get('code').value}\``)
            .setFooter(`${footer} - Made By Cryptonized`)
            .addField('Starting Balance', `\`${r.data.data.balance.starting} ${r.data.data.balance.currency}\``, true)
            .addField('Balance Remaining', `\`${r.data.data.balance.remaining} ${r.data.data.balance.currency}\``, true)
            .addField('Note', r.data.data.note || '`None`')

        interaction.reply({ embeds: [embed], ephemeral: true })
        
    },
};