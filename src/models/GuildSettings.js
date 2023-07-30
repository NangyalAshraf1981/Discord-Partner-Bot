const mongoose = require("mongoose");

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  partner: { type: String },
  desc: { type: String },
  lastBumpDate: { type: Date },
  image: { type: String },
});

const GuildSettings = mongoose.model("GuildSettings", guildSettingsSchema);

module.exports = GuildSettings;
