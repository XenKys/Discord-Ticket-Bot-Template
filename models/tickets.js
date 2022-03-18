const mongo = require("mongoose")

module.exports = mongo.model(
    "tickets",
    new mongo.Schema({
        ticketID: String,
        ownerID: String,
        messageID: String,
        locked: Boolean
    })
)