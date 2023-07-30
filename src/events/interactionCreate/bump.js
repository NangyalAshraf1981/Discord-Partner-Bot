const GuildSettings = require("../../models/GuildSettings");
const {
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const { bumpLogic } = require("../../handlers/functions");

module.exports = async (client, interaction) => {
  try {
    let wrong = ["wrong1captcha", "wrong2captcha", "wrong3captcha"];

    if (interaction.isButton()) {
      setTimeout(async () => {
        if (interaction.customId === "correctcaptcha") {
          interaction.reply({
            content: "Correct, Bumping Guild...",
            ephemeral: true,
          });
          const guildSettings = await GuildSettings.findOne({
            guildId: interaction.guild.id,
          });
          const invite = await interaction.guild.channels.cache
            .get(guildSettings.partner)
            .createInvite();
          await bumpLogic(client, interaction, invite, false);
          const now = new Date();
          guildSettings.lastBumpDate = now;
          await guildSettings.save();
        } else if (interaction.customId == "correctcaptcha_ephemeral") {
          interaction.reply({
            content: "Correct, Bumping Guild...",
            ephemeral: true,
          });
          const guildSettings = await GuildSettings.findOne({
            guildId: interaction.guild.id,
          });
          const invite = await interaction.guild.channels.cache
            .get(guildSettings.partner)
            .createInvite();
          await bumpLogic(client, interaction, invite, true);
          const now = new Date();
          guildSettings.lastBumpDate = now;
          await guildSettings.save();
        } else if (wrong.includes(interaction.customId)) {
          interaction.reply({
            content: "Invalid Response, Please Try Again later.",
            ephemeral: true,
          });
        }
      }, 1000);
    }
  } catch (error) {
    console.log(error);
  }
};
