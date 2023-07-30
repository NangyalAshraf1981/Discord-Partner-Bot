const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
  },
  usertag: {
    type: String,
  },
  userId: {
    type: String,
  },
  bumps: {
    type: Number,
    default: 1,
  },
  warns: {
    type: Number,
    default: 0,
  },
});

module.exports = model("User", userSchema);
