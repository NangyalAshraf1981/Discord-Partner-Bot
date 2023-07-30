const mongoose = require("mongoose");

const panelSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  panelChannelId: { type: String },
  panelMessageId: { type: String },
});

const panel = mongoose.model("panel", panelSchema);

module.exports = panel;
