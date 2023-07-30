const mongoose = require("mongoose");

const antiToxicSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  antitoxic: { type: Boolean },
  threshold: { type: Number, default: 85 },
  logchannel: { type: String },
});

const AntiToxic = mongoose.model("AntiToxic", antiToxicSchema);

module.exports = AntiToxic;
