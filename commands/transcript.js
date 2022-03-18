const DiscordJS = require("discord.js")
const DiscordTRANSCRIPTS = require("discord-html-transcripts")

const ticketsModel = require("../../models/tickets")

module.exports = {
    name: "transcript",
    description: "Save a ticket transcript",
    permissionRequired: "MANAGE_CHANNELS",
    /**
    * @param {DiscordJS.CommandInteraction} interaction 
    * @param {DiscordJS.Client} client 
    */
    run: async (interaction, client) => {
        let ticketsData = await ticketsModel.findOne({ ticketID: interaction.channelId }).catch((err) => console.log(err))

        if (!ticketsData) return await interaction.reply({ content: "This command is only available in tickets", ephemeral: true })

        const file = await DiscordTRANSCRIPTS.createTranscript(
            interaction.channel, {
                limit: -1,
                returnBuffer: false,
                fileName: `transcript-${interaction.channelId}.html`
            }
        )
    
        await interaction.reply({ files: [file] })
    }
}