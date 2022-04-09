const db = require('./db.js');

const getLeaderboardGraph = async () => {
    const users = await db.query('SELECT username, points FROM users ORDER BY points DESC LIMIT 5');
    console.log(`users: ${users}`);

    const chart = {
        type: 'bar',
        options: {
            title: {
                display: true,
                text: `Top ${users.rowCount} Contributors`,
            },
            scales: {
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Club Members',
                            fontStyle: 'bold',
                        },
                    },
                ],
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Points',
                            fontStyle: 'bold',
                        },
                    },
                ],
            },
        },
        data: {
            labels: [],
            datasets: [{
                label: 'Points',
                data: [],
            }],
        },
    };

    for (const user of users.rows) {
        chart.data.labels.push(user.username);
        chart.data.datasets[0].data.push(user.points);
    }

    chart.data.datasets[0].data.push(0);

    const encodedChart = encodeURIComponent(JSON.stringify(chart));
    const chartUrl = `https://quickchart.io/chart?bkg=%23FFFFFF&c=${encodedChart}`;

    return chartUrl;
};

module.exports = getLeaderboardGraph;