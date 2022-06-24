const { tebexSecret, embedColour } = require('../config').tebex;
const { dateformat, footer } = require('../config')
const Discord = require('discord.js')
const { default: axios } = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const moment = require('moment');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('lookupgiftcard')
        .setDescription('Check the value of a giftcard')
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
            method: 'get',
            url: `https://plugin.tebex.io/gift-cards/${id}`,
            headers: { 'X-Tebex-Secret': tebexSecret },
        });

        const date = new Date(Date.parse(res.data.data.created_at))

        const ecreatedat = moment(`${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`, 'DD/MM/YYYY')
        const createdat = moment(ecreatedat).format(dateformat)

        const embed = new Discord.MessageEmbed()
            .setColor(embedColour)
            .setThumbnail(interaction.guild.iconURL())
            .addField('Created', `\`${createdat}\``, true)
            .addField('Valid', res.data.data.void ? '`False`' : '`True`', true)
            .addField('Code', `\`${interaction.options.get('code').value}\``)
            .setFooter(`${footer} - Made By Cryptonized`)
            .addField('Starting Balance', `\`${res.data.data.balance.starting} ${res.data.data.balance.currency}\``, true)
            .addField('Balance Remaining', `\`${res.data.data.balance.remaining} ${res.data.data.balance.currency}\``, true)
            .addField('Note', res.data.data.note || '`None`')

        interaction.reply({ embeds: [embed], ephemeral: true })
        
    },
};