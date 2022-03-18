const DiscordJS = require("discord.js")

const client = new DiscordJS.Client(
    {
        intents: [
            "GUILDS",
            "GUILD_MEMBERS",
            "GUILD_MESSAGES"
        ]
    }
)

require("./handler")(client)

client.commands = new DiscordJS.Collection()
client.settings = require("./settings.json")

client.login(client.settings.BOT_TOKEN)

module.exports = client