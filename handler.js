const DiscordJS = require("discord.js")
const mongo = require("mongoose")
const { promisify } = require("util")
const { glob } = require("glob")

const globPromise = promisify(glob)

/**
* @param {DiscordJS.Client} client
*/
module.exports = async (client) => {
    const commandFiles = await globPromise(`${process.cwd()}/commands/*.js`)
    const arrayOfSlashCommands = []
    commandFiles.map((value) => {
        const file = require(value)

        if (!file?.name) return

        client.commands.set(file.name, file)

        if (["MESSAGE", "USER"].includes(file.type)) delete file.description

        arrayOfSlashCommands.push(file)

        client.on("ready", async () => {
            await client.guilds.cache.get(client.settings.SERVER_ID).commands.set(arrayOfSlashCommands)
        })
    })

    const eventFiles = await globPromise(`${process.cwd()}/events/*.js`)
    eventFiles.map((value) => require(value))

    mongo.connect(client.settings.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log("Connected to the database Mongo DB"))
}