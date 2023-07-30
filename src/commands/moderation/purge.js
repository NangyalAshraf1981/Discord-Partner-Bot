const {
  MessageEmbed,
  ApplicationCommandType,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Deletes Amount of Messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of Messages to be Deleted")
        .setRequired(true)
    ),
  async execute(client, interaction) {
    const amount = interaction.options.getInteger("amount");
    const embed = new EmbedBuilder()
      .setTitle("Messages Purged")
      .setDescription(`Deleted ${amount} messages`)
      .setColor("#2f3136")
      .setFooter({
        text: `Requested by: ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({
          dynamic: true,
          format: "png",
          size: 2048,
        }),
      });
    await interaction.channel.bulkDelete(amount);
    await interaction.reply({ embeds: [embed] });

    setTimeout(() => {
      interaction.deleteReply();
    }, 3 * 1000);
  },
};
