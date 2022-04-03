const { MessageEmbed } = require('discord.js'),
    CronJob = require('cron').CronJob,
    getLeaderboardGraph = require('../utilities/getLeaderboardGraph.js'),
    db = require('../utilities/db');

/*
Cron job format =  '* * * * * *'
Sec(0-59), min(0-59), hour(0-23), day of month(1-31), month(0-11), day of week(0-6 starting with sunday)
*/

// 1 11 * * 1
const weeklyLeaderboardResults = (client) => new CronJob('1 11 * * 1', async function() {
    const count = await db.query('SELECT COUNT(*) FROM users;');

    if (Number(count.rows[0].count) > 0) {
        try {
            const chartUrl = await getLeaderboardGraph();

            const users = await db.query('SELECT username, points FROM users ORDER BY points DESC LIMIT 5');

            const emojiSquare = ':white_small_square: ';

            let description = '';

            for (const user of users.rows) {
                description += emojiSquare + user.username + '\n';
            }

            const leaderboardResults = new MessageEmbed().setColor('#0080ff').setTitle('Weekly Leaderboard Results').setDescription(`Congratulations to the top ${users.rowCount} contributors!\n\n${description}`).setImage(chartUrl);

            client.channels.cache.get(process.env.TARGET_CHANNEL,
            ).send({ embeds: [leaderboardResults] });
        }
        catch (error) {
            console.error(error);
        }
    }
    else {
        client.channels.cache.get(process.env.TARGET_CHANNEL).send('Want to help your club? We are looking for new top contributors. Start by using the <:award:905616817102413825> emoji today!');
    }
});

// 0 11 20 4,11 *
const resetLeaderboard = (client) => new CronJob('0 11 20 4,11 *', async function() {
    try {
        await db.query('DELETE FROM users;');
        client.channels.cache.get(process.env.TARGET_CHANNEL).send('Leaderboard reset.');
    }
    catch (error) {
        console.error(error);
    }
});

module.exports = {
    weeklyLeaderboardResults,
    resetLeaderboard,
};
