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
    .setName("ban")
    .setDescription("Add or remove a ban for a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Ban the user.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to ban.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Reason for the ban.")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove the ban from a user")
        .addIntegerOption((option) =>
          option
            .setName("user_id")
            .setDescription("The user's ID you want to remove the ban for.")
            .setRequired(true)
        )
    ),

  async execute(client, interaction) {
    if (interaction.options.getSubcommand() === "add") {
      try {
        const user = await interaction.options.getUser("user");
        const target = await interaction.guild.members.fetch(user.id);
        const reason =
          interaction.options.getString("reason") || "No reason provided.";

        if (target.id === interaction.user.id) {
          return interaction.reply({
            content: "You cannot ban yourself.",
            ephemeral: true,
          });
        }

        if (target.id === client.user.id) {
          return interaction.reply({
            content: "Sorry, but I can't ban myself.",
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
              "I don't have a high enough role position to ban the user.",
            ephemeral: true,
          });
        }

        if (
          interaction.member.roles.highest.comparePositionTo(
            target.roles.highest
          ) < 0
        ) {
          return interaction.reply({
            content: "Your role isn't high enough to ban the user.",
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setTitle("Member Banned")
          .setDescription(`${target.user.username} has been banned.`)
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
            `You have been banned from ${interaction.guild.name}.\n> Reason: ${reason}`
          )
          .setColor("#2f3136");

        await target.ban({ reason: reason });
        await interaction.reply({ embeds: [embed] });
        await target.send({ embeds: [embed2] });
      } catch (error) {
        console.log(error);
      }
    } else if (interaction.options.getSubcommand() === "remove") {
      try {
        const memberId = interaction.options.getInteger("user_id");
        const user = await client.users.fetch(memberId);

        try {
          await interaction.guild.bans.fetch(memberId);
        } catch (e) {
          return interaction.reply({
            content: "The user is not banned.",
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setTitle("Ban Removed")
          .setDescription(`Ban removed from ${user.username}`)
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
            `Your ban in ${interaction.guild.name} has been removed.`
          )
          .setColor("#2f3136");

        await interaction.guild.bans.remove(memberId);
        await interaction.reply({ embeds: [embed] });
        await user.send({ embeds: [embed3] });
      } catch (error) {
        console.log(error);
      }
    }
  },
};
