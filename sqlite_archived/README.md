# Wake Tech Programming Club Bot

A custom Discord bot which manages several server affairs for the Wake Tech Programming Club such as the ability to 
create polls, generate coding questions from [binarysearch.com](https://binarysearch.com/), allowing members to award 
points to others for helpful contributions and showing the point leadership board, as well as ability to track 
programming projects.

## Slash Commands

| Name               | Description                                                                       |
|:-------------------|:----------------------------------------------------------------------------------|
| `/ping`            | Confirms bot is up and running                                                    |
| `/server`          | Responds with current server member count                                         |
| `/question easy`   | Returns question from binary search with easy difficulty                          |
| `/question medium` | Returns question from binary search with medium difficulty                        |
| `/question hard`   | Returns question from binary search with hard difficulty                          |
| `/question harder` | Returns question from binary search with harder difficulty                        |
| `/leaderboard`     | Shows top five server contributors                                                |
| `/meeting`         | Sets up a custom meeting using required fields date, time, topic, and description |
| `/poll`            | Set up a custom poll with either yes/no options or any number of poll choices     |
| `/project`         | Add, edit, and remove offical club projects                                       |

## Roadmap

- Server suggestions: allow users to request server changes via a bot command.

- Club meeting topic request: users will be able to add suggested club meeting topics and would have the ability to remove/edit their reponses.

## Installation

NOTE: While still fully functional, this archived version is no longer being maintained.

1. Rename **config-template.json** to **config.json** and fill out the variables as shown.

2. Install the bot:

`npm install`

`npm rebuild` #needed for sqlite to work

`node deploy-commands.js`

`node bot.js`

## Authors

- [@KatLands](https://github.com/KatLands)
- [@aahmad4](https://github.com/aahmad4)
