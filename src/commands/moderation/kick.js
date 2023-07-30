const {
  ApplicationCommandType,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to kick.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for kick.")
        .setRequired(false)
    ),

  async execute(client, interaction) {
    try {
      const target = await interaction.guild.members.fetch(
        interaction.options.getUser("user").id
      );
      const reason =
        interaction.options.getString("reason") || "No reason provided.";

      if (target.id === interaction.user.id)
        return interaction.reply({
          content: "You can't kick yourself.",
          ephemeral: true,
        });

      if (target.id === client.user.id)
        return interaction.reply({
          content: "Sorry, but I can't kick myself.",
          ephemeral: true,
        });

      if (
        interaction.guild.members.me.roles.highest.comparePositionTo(
          target.roles.highest
        ) < 0
      ) {
        return interaction.reply({
          content: "I don't have a high enough role position to kick the user.",
          ephemeral: true,
        });
      }

      if (
        interaction.member.roles.highest.comparePositionTo(
          target.roles.highest
        ) < 0
      ) {
        return interaction.reply({
          content: "Your role isn't high enough to kick the user.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("Member Kicked")
        .setDescription(`${target.user.username} has been kicked.`)
        .setColor("#2f3136")
        .setTimestamp()
        .setFooter({
          text: `Moderator: ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({
            dynamic: true,
            format: "png",
            size: 2048,
          }),
        });

      const embed2 = new EmbedBuilder()
        .setDescription(
          `You have been kicked from ${interaction.guild.name}.\n> Reason: ${reason}`
        )
        .setColor("#2f3136");

      await target.kick(reason);
      await interaction.reply({ embeds: [embed] });
      await target.send({ embeds: [embed2] });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: "Failed to kick the member.",
        ephemeral: true,
      });
    }
  },
};
