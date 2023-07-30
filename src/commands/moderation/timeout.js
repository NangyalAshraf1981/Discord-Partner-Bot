const {
  MessageEmbed,
  ApplicationCommandType,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const msconverter = require("ms");
const prettyms = require("pretty-ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Add or remove timeout for a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add timeout to a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to add the timeout to.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("duration")
            .setDescription("Duration of the timeout")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Reason for the timeout")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove timeout from a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to remove the timeout for.")
            .setRequired(true)
        )
    ),

  async execute(client, interaction) {
    if (interaction.options.getSubcommand() === "add") {
      try {
        const user = await interaction.options.getUser("user");
        const duration = await interaction.options.getString("duration");
        const target = await interaction.guild.members.fetch(user.id);
        const reason =
          interaction.options.getString("reason") || "No reason provided.";

        if (target.isCommunicationDisabled()) {
          return interaction.reply({
            content: "The user is already timed out.",
            ephemeral: true,
          });
        }

        if (target.id === interaction.user.id) {
          return interaction.reply({
            content: "You cannot time out yourself.",
            ephemeral: true,
          });
        }

        if (target.id === client.user.id) {
          return interaction.reply({
            content: "Sorry, but I cannot time out myself.",
            ephemeral: true,
          });
        }

        if (
          interaction.guild.members.me.roles.highest.comparePositionTo(
            target.roles.highest
          ) < 0
        ) {
          return interaction.reply({
            content:
              "I don't have a high enough role position to time out the user.",
            ephemeral: true,
          });
        }

        if (
          interaction.member.roles.highest.comparePositionTo(
            target.roles.highest
          ) < 0
        ) {
          return interaction.reply({
            content: "Your role isn't high enough to time out the user.",
            ephemeral: true,
          });
        }

        const ms = msconverter(duration);
        if (!ms) {
          return interaction.followUp(
            "Please provide a valid duration. Example: 1d 1h 1m 1s"
          );
        }

        if (ms > 2419200000) {
          return interaction.reply({
            content: "Sorry, the timeout duration cannot exceed 28 days.",
          });
        }

        const response = await target.timeout(ms, reason || null);
        const embed = new EmbedBuilder()
          .setTitle("Timeout Added")
          .setDescription(
            `Timeout added to ${user.username} for ${prettyms(ms, {
              verbose: true,
            })}`
          )
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

        interaction.reply({ embeds: [embed] });

        const embed2 = new EmbedBuilder()
          .setDescription(
            `You are timed out in ${
              interaction.guild.name
            }\n\nTimeout duration: ${prettyms(ms, {
              verbose: true,
            })}\n\nReason: ${reason}`
          )
          .setColor("#2f3136");

        const embed3 = new EmbedBuilder()
          .setDescription(
            `Your timeout in ${interaction.guild.name} has finished.`
          )
          .setColor("#2f3136");

        target.send({ embeds: [embed2] }).then(() => {
          setTimeout(() => {
            target.timeout(null).then(() => {
              target.send({ embeds: [embed3] });
            });
          }, ms);
        });
      } catch (error) {
        console.log(error);
      }
    } else if (interaction.options.getSubcommand() === "remove") {
      try {
        const member = interaction.options.getUser("user");
        const target = await interaction.guild.members.fetch(member.id);

        if (!target.isCommunicationDisabled()) {
          return interaction.reply({
            content: "The user is not timed out.",
            ephemeral: true,
          });
        }

        if (
          interaction.guild.members.me.roles.highest.comparePositionTo(
            target.roles.highest
          ) < 0
        ) {
          return interaction.reply({
            content:
              "I don't have a high enough role position to remove the timeout for the user.",
            ephemeral: true,
          });
        }

        if (
          interaction.member.roles.highest.comparePositionTo(
            target.roles.highest
          ) < 0
        ) {
          return interaction.reply({
            content:
              "Your role isn't high enough to remove the timeout from the user.",
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setTitle("Timeout Removed")
          .setDescription(`Timeout removed from ${member.username}`)
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

        const embed3 = new EmbedBuilder()
          .setDescription(
            `Your timeout in ${interaction.guild.name} has been removed.`
          )
          .setColor("#2f3136");

        target.timeout(null);
        interaction.reply({ embeds: [embed] });
        target.send({ embeds: [embed3] });
      } catch (error) {
        console.log(error);
      }
    }
  },
};
