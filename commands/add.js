const DiscordJS = require("discord.js")

const ticketsModel = require("../../models/tickets")

module.exports = {
    name: "add",
    description: "Give access to view ticket to a user",
    options: [
        {
            name: "user",
            description: "The user you want to add to the ticket",
            type: "USER",
            required: true
        }
    ],
    permissionRequired: "MANAGE_CHANNELS",
    /**
    * @param {DiscordJS.CommandInteraction} interaction 
    * @param {DiscordJS.Client} client 
    */
    run: async (interaction, client) => {
        let target = interaction.guild.members.cache.get(interaction.options.getUser("user").id)
        let ticketsData = await ticketsModel.findOne({ ticketID: interaction.channelId }).catch((err) => console.log(err))

        if (!ticketsData) return await interaction.reply({ content: "This command is only available in tickets", ephemeral: true }) // Check if the channel is a ticket
        if (interaction.channel.permissionsFor(target).has("VIEW_CHANNEL")) return await interaction.reply({ content: "This user already has permission to view the ticket", ephemeral: true }) // Check if the target has already the permission to view the ticket 

        await interaction.channel.permissionOverwrites.edit(
            target, {
                VIEW_CHANNEL: true // Add the permission to view the ticket to the target
            }
        )
        await interaction.reply({ content: `Added ${target.toString()} in the ticket` })
    }
}