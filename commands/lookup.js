const Discord = require('discord.js');
const { footer } = require('../config')
const { tebexSecret, embedColour } = require('../config').tebex;
const { default: axios } = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('lookup')
        .setDescription('Verifies a payment ID')
        .addStringOption(option => option.setName('id').setDescription('The payment / checkout ID').setRequired(true)),
        async execute(interaction) {
            const res = await axios.get(`https://plugin.tebex.io/payments/${interaction.options.get('id').value}`, {
                method: 'GET',
                headers: { 'X-Tebex-Secret': tebexSecret },
            }).catch(err => {
                return interaction.reply({ content: 'No purchase found with that ID!', ephemeral: true })
            })

            if(!res) return;
            const data = await res.data;
            
            if(data.status !==  'Complete') return interaction.reply({ content: `Purchase is currently marked as ${data.status}`})

            const packages = data.packages.map(package => package.name)

            const embed = new Discord.MessageEmbed()
                .setColor(embedColour)
                .setAuthor(`Purchase Lookup`)
                .setThumbnail(interaction.guild.iconURL())
                .addField(`Price Payed`, `${data.amount} ${data.currency.iso_4217}`)
                .addField(`Date Purchased`, data.date.slice(0,10))
                .addField(`Item(s) Purchased`, packages.join(', '))
                .addField(`Player Name`, data.player.name)
                .addField(`Email`, data.email)
                .setFooter(`${footer} - Made By Cryptonized`, interaction.guild.iconURL());
            interaction.reply({ embeds: [embed] })
    },
};