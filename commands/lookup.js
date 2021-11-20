const Discord = require('discord.js');
const { footer } = require('../config')
const { tebexSecret, embedColour } = require('../config').tebex;
const { default: axios } = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lookup')
        .setDescription('Verifies a payment ID')
        .addStringOption(option => option.setName('id').setDescription('The payment / checkout ID').setRequired(true)),
        async execute(interaction) {
            let failed
            const r = await axios.get(`https://plugin.tebex.io/payments/${interaction.options.get('id').value}`, {
                method: 'GET',
                headers: { 'X-Tebex-Secret': tebexSecret },
                })
                .catch(err => {
                    failed = true;
                    return interaction.reply({ content: 'No purchase found with that ID!', ephemeral: true })
                })

            if(failed === true) return;
            const d = await r.data;
            
            if(d.status !==  'Complete') return interaction.reply({ content: `Purchase is currently marked as ${d.status}`})

            let eee = [];

            d.packages.forEach(a => {
                eee.push(a.name)
            })

            const embed = new Discord.MessageEmbed()
                .setColor(embedColour)
                .setAuthor(`Purchase Lookup`)
                .setThumbnail(interaction.guild.iconURL())
                .addField(`Price Payed`, `${d.amount} ${d.currency.iso_4217}`)
                .addField(`Date Purchased`, d.date.slice(0,10))
                .addField(`Item(s) Purchased`, eee.join(', '))
                .addField(`Player Name`, d.player.name)
                .addField(`Email`, d.email)
                .setFooter(`${footer} - Made By Cryptonized`, interaction.guild.iconURL());
            interaction.reply({ embeds: [embed] })
    },
};