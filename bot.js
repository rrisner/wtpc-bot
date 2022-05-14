require('dotenv').config();

const { Client, Collection, Intents, MessageEmbed } = require('discord.js'),
    fs = require('fs'),
    db = require('./utilities/db.js'),
    { weeklyLeaderboardResults, resetLeaderboard } = require('./tasks/tasks.js');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS],
    partials: ['MESSAGE', 'REACTION'],
});

client.on('ready', () => {
    console.log(`Logged in: ${client.user.tag}`);
    client.user.setPresence({ activities: [{ name: 'Type /help in any channel for FAQ\'s' }], status: 'online' });
});

client.on('guildMemberAdd', member => {
    const welcomeMessage = new MessageEmbed()
        .setColor('#0080ff')
        .setTitle('Welcome to the Wake Tech Programming Club!')
        .setDescription('•    The announcements channel is where you will find important club updates.\n•    The club meets every other Tuesday at 6pm.\n•     Check out the Events tab on the top left for more information on club meetings.\n•    We have many help channels available based on language.\n•    Type /project in any channel to see more information about club projects.\n•    Type /help in any channel for more server information.\n•    We\'re glad to have you here! Please remember to fill out the forms mentioned in the welcome landing page.')
        .setImage(
            'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
        );

    client.channels.cache.get(process.env.WELCOME_CHANNEL,
    ).send(member.toString());
    client.channels.cache.get(process.env.WELCOME_CHANNEL,
    ).send({ embeds: [welcomeMessage] });
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        }
        catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
        }
    }

    if (!reaction.message.guild.me.permissionsIn(reaction.message.channel).has('SEND_MESSAGES')) return;

    if (reaction.emoji.name === 'award' && reaction.message.author.id !== user.id) {
        const foundUser = await db.query('SELECT id, points FROM users WHERE username = $1', [reaction.message.author.username]);
        console.log(`foundUser: ${foundUser}`);

        if (foundUser.rowCount > 0) {
            const prevPoints = Number(foundUser.rows[0].points);
            await db.query('UPDATE users SET points = $1 WHERE id = $2', [prevPoints + 5, foundUser.rows[0].id]);
            console.log(`Updated user: ${foundUser.rows[0].username} to points: ${prevPoints + 5}`);
            reaction.message.channel.send(`Congrats <@${reaction.message.author.id}>, <@${user.id}> just awarded you 5 points! (Total points: ${prevPoints + 5})`);
        }
        else {
            await db.query('INSERT INTO users (username, points) VALUES ($1, 5)', [reaction.message.author.username]);
            console.log(`Added user: ${reaction.message.author.username} with default points: 5`);
            reaction.message.channel.send(`Congrats <@${reaction.message.author.id}>,  <@${user.id}> just awarded you 5 points! (Total points: 5)`);
        }
    }
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.buttons = new Collection();

const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`);
    client.buttons.set(button.data.name, button);
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const button = client.buttons.get(interaction.customId);

    if (!button) return;

    try {
        await button.execute(interaction);
    }
    catch (error) {
        console.error(error);
        await interaction.deferUpdate();
    }
});

// Start cron tasks
weeklyLeaderboardResults(client).start();
resetLeaderboard(client).start();
// dayBeforeReminder(client).start();
// meetingStart(client).start();

client.login(process.env.TOKEN);
