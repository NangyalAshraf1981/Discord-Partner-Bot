const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  AttachmentBuilder,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder,
} = require("discord.js");
const GuildSettings = require("../models/GuildSettings");
const prettyMS = require("pretty-ms");
const { devs } = require("../../config.json");
const { CaptchaGenerator } = require("captcha-canvas");
const { shuffle, generateCaptcha } = require('../handlers/functions')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bump")
    .setDescription("Bump the server's advertisement.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.CreateInstantInvite),

  async execute(client, interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      const ignoreCooldown = false;
      const now = new Date();
      const cooldown = 10 * 60 * 1000;

      if (
        !interaction.guild.members.me.permissions.has(
          PermissionFlagsBits.CreateInstantInvite
        ) ||
        !interaction.guild.members.me.permissions.has(
          PermissionFlagsBits.ManageGuild
        )
      ) {
        await interaction.editReply({
          content:
            "I need the `Create Instant Invite` and `Manage Guild` permissions to bump.",
          ephemeral: true,
        });
        return;
      }

      const guildId = interaction.guild.id;

      try {
        const guildSettings = await GuildSettings.findOne({ guildId });

        if (!guildSettings) {
          await interaction.editReply({
            content: "This server hasn't been set up.",
            ephemeral: true,
          });
          return;
        }

        if (!guildSettings.partner) {
          await interaction.editReply({
            content:
              "You must first initialize a channel for the bot in this server before you can bump your server.",
            ephemeral: true,
          });
          return;
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

        const correctCap = generateCaptcha();
        const captcha = new CaptchaGenerator()
          .setDimension(100, 300)
          .setCaptcha({ text: correctCap, size: 40 })
          .setDecoy({ opacity: 0.5 })
          .setTrace({ color: "#32cf7e" });
        const buffer = captcha.generateSync();

        const correct = new ButtonBuilder()
          .setCustomId("correctcaptcha")
          .setLabel(captcha.text)
          .setStyle(ButtonStyle.Secondary);
        const wrong1 = new ButtonBuilder()
          .setCustomId("wrong1captcha")
          .setLabel(generateCaptcha())
          .setStyle(ButtonStyle.Secondary);
        const wrong2 = new ButtonBuilder()
          .setCustomId("wrong2captcha")
          .setLabel(generateCaptcha())
          .setStyle(ButtonStyle.Secondary);
        const wrong3 = new ButtonBuilder()
          .setCustomId("wrong3captcha")
          .setLabel(generateCaptcha())
          .setStyle(ButtonStyle.Secondary);
        let buttons = [correct, wrong1, wrong2, wrong3];
        let randomButton = shuffle(buttons);
        const row = new ActionRowBuilder().addComponents(randomButton);

        let embed = new EmbedBuilder()
          .setColor("#2f3136")
          .setTitle("Captcha Verification")
          .setImage("attachment://captcha.png");
        let captchaImage = new AttachmentBuilder(await buffer, {
          name: "captcha.png",
        });
        let mainMsg = await interaction.editReply({
          embeds: [embed],
          files: [captchaImage],
          components: [row],
          ephemeral: true,
        });
        setTimeout(() => {
          interaction.editReply({
            ephemeral: true,
            components: [],
          });
        }, 5000);
      } catch (error) {
        console.error("Error:", error);
        await interaction.editReply({
          content: "An error occurred while processing the command.",
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};

