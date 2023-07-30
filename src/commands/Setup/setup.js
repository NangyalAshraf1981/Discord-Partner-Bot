const {
  PermissionFlagsBits,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRow,
  MessageEmbed,
  ApplicationCommandType,
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Embed,
} = require("discord.js");
const GuildSettings = require("../../models/GuildSettings");
const UserSettings = require("../../models/UserSettings");
const AntiToxic = require("../../models/AntiToxic");
const prettyMS = require("pretty-ms");
const { devs } = require("../../../config.json");
const { getLeaderboard } = require("../../handlers/functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Manage roles of the server or members.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("advertisement")
        .setDescription("Setup server's advertisement and partner channel.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("panel")
        .setDescription("Send a panel.")
        .addChannelOption((channel) =>
          channel
            .setName("channel")
            .setDescription("The channel to send the panel to.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("anti_toxic")
        .setDescription("Set up Anti-Toxic moderation.")
    ),

  async execute(client, interaction) {
    if (interaction.options.getSubcommand() === "advertisement") {
      try {
        let guildSettings = await GuildSettings.findOne({
          guildId: interaction.guild.id,
        });
        if (!guildSettings) {
          guildSettings = new GuildSettings({ guildId: interaction.guild.id });
        }
        guildSettings.save();

        const modal = new ModalBuilder()
          .setCustomId("setup")
          .setTitle("Server Setup");

        const channelInput = new TextInputBuilder()
          .setCustomId("setup_modal_channel_input")
          .setLabel("Channel ID:")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(20)
          .setMinLength(18)
          .setRequired(false);

        const descriptionInput = new TextInputBuilder()
          .setCustomId("setup_modal_description_input")
          .setLabel("Server Description:")
          .setPlaceholder(
            "Note: Server Invite would automatically be placed under Server Description."
          )
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false);

        const imageInput = new TextInputBuilder()
          .setCustomId("setup_modal_img_input")
          .setLabel("Image / Gif:")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder(
            "https://cdn.discordapp.com/attachments/.../.../....png"
          )
          .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(
          channelInput
        );
        const secondActionRow = new ActionRowBuilder().addComponents(
          descriptionInput
        );
        const thirdActionRow = new ActionRowBuilder().addComponents(imageInput);

        modal.addComponents(firstActionRow);
        modal.addComponents(secondActionRow);
        modal.addComponents(thirdActionRow);

        if (guildSettings.partner) {
          channelInput.setValue(guildSettings.partner);
        }
        if (guildSettings.desc) {
          descriptionInput.setValue(guildSettings.desc);
        }
        if (guildSettings.image) {
          imageInput.setValue(guildSettings.image);
        }
        await interaction.showModal(modal);
      } catch (error) {
        console.error("Error:", error);
        await interaction.reply({
          content: "An error occurred while setting up the bot.",
          ephemeral: true,
        });
      }
    } else if (interaction.options.getSubcommand() === "panel") {
      await interaction.deferReply();
      const Panel = require("../../models/panel");
      let panel = await Panel.findOne({ guildId: interaction.guild.id });
      if (!panel) {
        panel = new Panel({ guildId: interaction.guild.id });
      }
      const ignoreCooldown = false;
      const now = new Date();
      const cooldown = 10 * 60 * 1000;
      const channel = interaction.options.getChannel("channel");
      const guildSettings = await GuildSettings.findOne({
        guildId: interaction.guild.id,
      });
      if (!guildSettings) {
        return interaction.editReply({
          content: "Sorry, the server hasn't been set up yet.",
          ephemeral: true,
        });
      }
      if (!guildSettings.partner) {
        return interaction.editReply({
          content: "Sorry, the partner channel hasn't been set up yet.",
          ephemeral: true,
        });
      }
      if (!guildSettings.desc) {
        return interaction.editReply({
          content: "Sorry, the server description hasn't been set up yet.",
          ephemeral: true,
        });
      }
      if (!devs.includes(interaction.user.id)) {
        if (now - guildSettings.lastBumpDate <= cooldown && !ignoreCooldown) {
          const remainingTime = cooldown - (now - guildSettings.lastBumpDate);
          await interaction.editReply({
            content: `You must wait ${prettyMS(remainingTime, {
              verbose: true,
            })} before you can bump this guild.`,
            ephemeral: true,
          });
          return;
        }
      }
      getLeaderboard(interaction.guild.id);

      const verifyBtn = new ButtonBuilder()
        .setCustomId("bump")
        .setLabel("Bump")
        .setStyle(ButtonStyle.Primary);
      const whereAmIBtn = new ButtonBuilder()
        .setCustomId("whereami")
        .setLabel("Where am I?")
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(verifyBtn, whereAmIBtn);
      const desc = await getLeaderboard(interaction.guild.id);
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const currentMonthIndex = now.getMonth();
      const currentMonth = months[currentMonthIndex];
      const embed = new EmbedBuilder()
        .setColor("#2f3136")
        .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL({
            dynamic: true,
            format: "png",
            size: 2048,
          }),
        })
        .setTitle(`${currentMonth} Leaderboard`)
        .setDescription(`${desc}`);
      const sentMsg = await channel.send({
        embeds: [embed],
        components: [row],
        fetchReply: true,
      });
      panel.panelChannelId = channel.id;
      panel.panelMessageId = sentMsg.id;
      panel.save();
      interaction.followUp({ content: `Panel sent to <#${channel.id}>.` });
    } else if (interaction.options.getSubcommand() === "anti_toxic") {
      try {
        let antiToxic = await AntiToxic.findOne({
          guildId: interaction.guild.id,
        });
        if (!antiToxic) {
          antiToxic = new AntiToxic({ guildId: interaction.guild.id });
        }
        const enableBtn = new ButtonBuilder()
          .setCustomId("enable")
          .setLabel("Enable")
          .setStyle(ButtonStyle.Primary);
        const disableBtn = new ButtonBuilder()
          .setCustomId("disable")
          .setLabel("Disable")
          .setStyle(ButtonStyle.Danger);
        const logChlBtn = new ButtonBuilder()
          .setCustomId("logchl")
          .setLabel("Log Channel")
          .setStyle(ButtonStyle.Secondary);
        const thresholdBtn = new ButtonBuilder()
          .setCustomId("threshold")
          .setLabel("Threshold")
          .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().setComponents(
          enableBtn,
          disableBtn,
          logChlBtn,
          thresholdBtn
        );

        await interaction.reply({ components: [row], ephemeral: true });
      } catch (error) {
        console.error("Error:", error);
        await interaction.reply({
          content: "An error occurred while setting up the bot.",
          ephemeral: true,
        });
      }
    }
  },
};
