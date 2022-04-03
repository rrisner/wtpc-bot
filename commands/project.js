const { SlashCommandBuilder } = require('@discordjs/builders'),
    { MessageEmbed } = require('discord.js'),
    db = require('../utilities/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('project')
        .setDescription('View or add projects')
        .addSubcommand((subcommand) =>
            subcommand.setName('add').setDescription('Add a WTPC project')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Enter a project name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('contact')
                        .setDescription('Enter project lead contact-information')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Enter brief project description')
                        .setRequired(true)),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('view').setDescription('View all WTPC projects'),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('update').setDescription('Edit a WTPC project')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Enter name of project to update')
                        .setRequired(true),
                )
                .addStringOption(option =>
                    option.setName('new-name')
                        .setDescription('Enter new name of project'),
                )
                .addStringOption(option =>
                    option.setName('new-contact')
                        .setDescription('Enter new contact information of project'),
                )
                .addStringOption(option =>
                    option.setName('new-description')
                        .setDescription('Enter new description of project'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('delete').setDescription('Delete a WTPC project')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Enter name of project to delete')
                        .setRequired(true),
                ),
        ),

    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        const projectEmbed = new MessageEmbed().setColor('#0080ff');

        if (subCommand === 'add') {
            const projectName = interaction.options.getString('name');
            const contactInfo = interaction.options.getString('contact');
            const description = interaction.options.getString('description');

            await db.query('INSERT INTO projects (name, contact, description) VALUES ($1, $2, $3)', [projectName, contactInfo, description]);

            projectEmbed
                .setTitle('Project Successfully Added')
                .setDescription(`**Project name:** ${projectName}\n**Contact information:** ${contactInfo} \n**Description:** ${description}** **`);
        }
        else if (subCommand === 'view') {
            const projects = await db.query('SELECT name, contact, description FROM projects');

            const projectsToDisplay = projects.rows.map(project =>
                '**Project name:** ' + project.name + '\n' +
                '**Contact information:** ' + project.contact + '\n' +
                '**Description:** ' + project.description + '\n\n',
            );

            projectEmbed.setTitle('WTPC Active Projects').setDescription(projectsToDisplay.join(''));
        }
        else if (subCommand === 'update') {
            const projectName = interaction.options.getString('name');
            const newProjectName = interaction.options.getString('new-name');
            const newContactInfo = interaction.options.getString('new-contact');
            const newDescription = interaction.options.getString('new-description');

            const foundProject = await db.query('SELECT id, name, contact, description FROM projects WHERE name = $1', [projectName]);

            if (foundProject.rowCount > 0) {
                const projectNameToUpdate = newProjectName || foundProject.rows[0].name;
                const contactInfoToUpdate = newContactInfo || foundProject.rows[0].contact;
                const descriptionToUpdate = newDescription || foundProject.rows[0].description;

                await db.query('UPDATE projects SET name = $1, contact = $2, description = $3 WHERE id = $4', [
                    projectNameToUpdate,
                    contactInfoToUpdate,
                    descriptionToUpdate,
                    foundProject.rows[0].id,
                ]);

                projectEmbed
                    .setTitle(`Project ${projectName} Successfully Updated`)
                    .setDescription(`**Project name:** ${projectNameToUpdate}\n**Contact information:** ${contactInfoToUpdate} \n**Description:** ${descriptionToUpdate}** **`);
            }
            else {
                projectEmbed
                    .setTitle('Could Not Find Project')
                    .setDescription('We couldn\'t find a project with that given name. Please double check to make sure it matches exactly!');
            }
        }
        else if (subCommand === 'delete') {
            const projectName = interaction.options.getString('name');

            const foundProject = await db.query('SELECT id, name, contact, description FROM projects WHERE name = $1', [projectName]);

            if (foundProject.rowCount > 0) {
                await db.query('DELETE FROM projects WHERE name = $1', [foundProject.rows[0].name]);

                projectEmbed
                    .setTitle(`Project ${projectName} Successfully Deleted`)
                    .setDescription('Project removed');
            }
            else {
                projectEmbed
                    .setTitle('Could Not Find Project')
                    .setDescription('We couldn\'t find a project with that given name. Please double check to make sure it matches exactly!');
            }
        }

        await interaction.reply({ embeds: [projectEmbed] });
    },
};

