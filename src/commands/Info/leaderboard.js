const {
  PermissionFlagsBits,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const GuildSettings = require("../../models/GuildSettings");
const UserSettings = require("../../models/UserSettings");
const prettyMS = require("pretty-ms");
const { devs } = require("../../../config.json");
const { getLeaderboard } = require("../../handlers/functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("sends a leaderboard")
    .setDMPermission(false),

  async execute(client, interaction) {
    try {
      await interaction.deferReply();
      const ignoreCooldown = false;
      const now = new Date();
      const cooldown = 10 * 60 * 1000;
      const channel = interaction.options.getChannel("channel");
      const guildSettings = await GuildSettings.findOne({
        guildId: interaction.guild.id,
      });
      if (!guildSettings)
        return interaction.editReply({
          content: " Sorry, The Server Hasnt Been Setup Yet.",
          ephemeral: true,
        });
      if (!guildSettings.partner)
        return interaction.editReply({
          content: " Sorry, The Partner Channel Hasnt Been Setup Yet.",
          ephemeral: true,
        });
      if (!guildSettings.desc)
        return interaction.editReply({
          content: " Sorry, The Server Description Hasnt Been Setup Yet.",
          ephemeral: true,
        });
      const data = await getLeaderboard(interaction.guild.id);
      let embed = new EmbedBuilder()
        .setTitle(`${interaction.guild.name}'s Leaderoard`)
        .setColor("#2f3136")
        .setDescription(`${data}`);
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      console.log(e);
    }
  },
};
