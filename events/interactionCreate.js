const client = require("../index")

const DiscordJS = require("discord.js")

const ticketsModel = require("../models/tickets")

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId == "open") {
            const ticketsData = await ticketsModel.findOne({ ownerID: interaction.user.id }).catch((err) => console.log(err))

            if (ticketsData) return await interaction.reply({ content: `You already have a ticket open (${interaction.guild.channels.cache.get(ticketsData.ticketID).toString()})`, ephemeral: true }) // Check if the user already has a ticket open

            const ticketChannel = await interaction.guild.channels.create(
                `ticket-${interaction.user.username}`, { // The name of the ticket
                    type: "GUILD_TEXT",
                    parent: client.settings.TICKETS_CATEGORY_ID, // Set the ticket category
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, // Remove the permission to view the ticket from everyone
                            deny: ["VIEW_CHANNEL"]
                        }, {
                            id: interaction.user.id, // Add the permission to view the ticket to the user
                            allow: ["VIEW_CHANNEL"]
                        }, {
                            id: client.settings.SUPPORT_ROLE_ID, // Add the permission to view the ticket to the support role
                            allow: ["VIEW_CHANNEL"]
                        }
                    ]
                }
            )

            ticketChannel.send({
                content: `${interaction.user.toString()} thanks for opening a ticket`,
                components: [
                    new DiscordJS.MessageActionRow()
                    .addComponents(
                        new DiscordJS.MessageButton()
                        .setCustomId("close")
                        .setLabel("Close ticket")
                        .setStyle("DANGER"),
                        new DiscordJS.MessageButton()
                        .setCustomId("unlock")
                        .setLabel("Unlock ticket")
                        .setStyle("SUCCESS")
                    )
                ]
            })
        } else if (interaction.customId == "unlock") {
            const ticketsData = await ticketsModel.findOne({ ticketID: interaction.channelId }).catch((err) => console.log(err))

            if (!ticketsData) return await interaction.deferUpdate().catch(() => {}) // Check if the channel is a ticket
            if (ticketsData.locked == false) return await interaction.reply({ content: "The ticket is not locked", ephemeral: true }) // Check if the ticket is already unlocked

            await interaction.channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone, {
                    VIEW_CHANNEL: true // Add the permission to view the ticket to everyone
                }
            )
            await interaction.reply({ content: "The ticket has been locked" })

            interaction.message.edit({
                content: interaction.message.content,
                components: [
                    new DiscordJS.MessageActionRow()
                    .addComponents(
                        new DiscordJS.MessageButton()
                        .setCustomId("close")
                        .setLabel("Close ticket")
                        .setStyle("DANGER"),
                        new DiscordJS.MessageButton()
                        .setCustomId("lock")
                        .setLabel("Lock ticket")
                        .setStyle("SUCCESS")
                    )
                ]
            })
        } else if (interaction.customId == "lock") {
            const ticketsData = await ticketsModel.findOne({ ticketID: interaction.channelId }).catch((err) => console.log(err))

            if (!ticketsData) return await interaction.deferUpdate().catch(() => {}) // Check if the channel is a ticket
            if (ticketsData.locked == true) return await interaction.reply({ content: "The ticket is already locked", ephemeral: true }) // Check if the ticket is not unlocked

            await interaction.channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone, {
                    VIEW_CHANNEL: false // Remove the permission to view the ticket from everyone
                }
            )
            await interaction.reply({ content: "The ticket has been unlocked" })

            interaction.message.edit({
                content: interaction.message.content,
                components: [
                    new DiscordJS.MessageActionRow()
                    .addComponents(
                        new DiscordJS.MessageButton()
                        .setCustomId("close")
                        .setLabel("Close ticket")
                        .setStyle("DANGER"),
                        new DiscordJS.MessageButton()
                        .setCustomId("unlock")
                        .setLabel("Unlock ticket")
                        .setStyle("SUCCESS")
                    )
                ]
            })
        } else if (interaction.customId == "close") {
            const ticketsData = await ticketsModel.findOne({ ticketID: interaction.channelId }).catch((err) => console.log(err))

            if (!ticketsData) return await interaction.deferUpdate().catch(() => {}) // Check if the channel is a ticket

            await interaction.channel.delete().catch(() => {})
        }
    } else if (interaction.isCommand()) {
        const cmd = client.commands.get(interaction.commandName)
        if (!cmd) return await interaction.reply({ content: "An error occured while running the command", ephemeral: true }) && client.commands.delete(interaction.commandName)

        if (cmd.permissionRequired) {
            if (!interaction.guild.me.permissions.has(cmd.permissionRequired)) return await interaction.reply({ content: "I need all the necessary permissions", ephemeral: true })
                else
            if (!interaction.member.permissions.has(cmd.permissionRequired)) return await interaction.reply({ content: "You need all the necessary permissions", ephemeral: true })
        }
        
        cmd.run(interaction, client)
    }
})