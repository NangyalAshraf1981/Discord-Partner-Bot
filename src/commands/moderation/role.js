const {
  MessageEmbed,
  ApplicationCommandType,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Manage roles of the server or members.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a role to a user.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to add the role to.")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role you want to add to the user.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a role to a user.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to remove the role from.")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role you want to remove from the user.")
            .setRequired(true)
        )
    ),
  async execute(client, interaction) {
    if (interaction.options.getSubcommand() === "add") {
      try {
        const member = interaction.options.getUser("user");
        const role = interaction.options.getRole("role");
        if (
          interaction.guild.members.me.roles.highest.comparePositionTo(role) < 0
        ) {
          return interaction.reply({
            content:
              "My Role Position isnt High Enough to Add that role to the User.",
            ephemeral: true,
          });
        }
        if (interaction.member.roles.highest.comparePositionTo(role) < 0) {
          return interaction.reply({
            content: "You do not have permission to add that role to the user.",
            ephemeral: true,
          });
        }
        const guildmemer = await interaction.guild.members.fetch(member.id);
        guildmemer.roles.add(role.id);
        const embed = new EmbedBuilder()
          .setTitle("Role Added")
          .setDescription(`Successfully added the role ${role} to ${member}`)
          .setColor("#2f3136")
          .setTimestamp()
          .setFooter({
            text: `Requested by: ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              format: "png",
              size: 2048,
            }),
          });

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.log(error);
      }
    } else if (interaction.options.getSubcommand() === "remove") {
      try {
        const member = interaction.options.getUser("user");
        const role = interaction.options.getRole("role");
        if (
          interaction.guild.members.me.roles.highest.comparePositionTo(role) < 0
        ) {
          return interaction.reply({
            content:
              "My Role Position isnt High Enough to Remove the role from the User.",
            ephemeral: true,
          });
        }
        if (interaction.member.roles.highest.comparePositionTo(role) < 0) {
          return interaction.reply({
            content:
              "You do not have permission to remove the role from the user.",
            ephemeral: true,
          });
        }
        const guildmemer = await interaction.guild.members.fetch(member.id);
        guildmemer.roles.remove(role.id);
        const embed = new EmbedBuilder()
          .setTitle("Role Removed")
          .setDescription(
            `Successfully Removed the role ${role} From ${member}`
          )
          .setColor("#2f3136")
          .setTimestamp()
          .setFooter({
            text: `Requested by: ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              format: "png",
              size: 2048,
            }),
          });

        return interaction.reply({ embeds: [embed] });
      } catch (e) {
        console.log(e);
      }
    }
  },
};
