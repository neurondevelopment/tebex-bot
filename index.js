const Discord = require('discord.js');
const fs = require('fs');
const figlet = require('figlet');
const { token, serverID } = require('./config')


const client  = new Discord.Client({
    partials: ['CHANNEL', 'MESSAGE', "REACTION", 'GUILD_MEMBER'],
    intents: 513
});
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith('.js'));

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [];

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());  
    client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '9' }).setToken(token);


client.on('ready', async () => {
    try {
		await rest.put(
			Routes.applicationGuildCommands(client.user.id, serverID),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}

    figlet('Neuron Development', function(err, data) {
        if (err) {
            console.log(err)
            return;
        }
        console.log(`\x1b[36m%s\x1b[0m`, data)
        console.log('Started bot')
    });

})

client.on('interactionCreate', async (interaction) => {
    if(interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            if(command.perms[0] && !command.perms.some(currPerm => interaction.member.permissions.has(currPerm) || interaction.member.roles.cache.some(role => role.id === currPerm))) return interaction.reply({ content: `You do not have permission to run this command!`, ephemeral: true })
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
    
})

client.login(token)