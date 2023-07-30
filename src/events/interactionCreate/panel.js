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
const {
  getUserPlacement,
  generateCaptcha,
  shuffle,
} = require("../../handlers/functions");
const GuildSettings = require("../../models/GuildSettings");
const { devs } = require("../../../config.json");
module.exports = async (client, interaction) => {
  try {
    if (interaction.customId == "bump") {
      await interaction.deferReply({ ephemeral: true });
      const ignoreCooldown = false;
      const now = new Date();
      const cooldown = 10 * 60 * 1000;
      const { CaptchaGenerator } = require("captcha-canvas");
      const guildId = interaction.guild.id;

      const guildSettings = await GuildSettings.findOne({ guildId });

      if (!guildSettings) {
        await interaction.editReply({
          content: `This Server Hasn't Been Setup.`,
          ephemeral: true,
        });
        return;
      }

      if (!guildSettings.partner) {
        await interaction.editReply({
          content: `You must first initialize a channel for the bot in this server before you can bump your server.`,
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
      //Captcha
      const correctcap = generateCaptcha();
      const captcha = new CaptchaGenerator()
        .setDimension(100, 300)
        .setCaptcha({ text: correctcap, size: 40 })
        .setDecoy({ opacity: 0.5 })
        .setTrace({ color: "#32cf7e" });
      const buffer = captcha.generateSync();
      /*captcha.async = true;
          captcha.addDecoy();
          captcha.drawTrace();
          captcha.drawCaptcha();*/

      console.log(captcha.text);
      const correct = new ButtonBuilder()
        .setCustomId("correctcaptcha_ephemeral")
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
let randombutton = await shuffle(buttons);
      const row = new ActionRowBuilder().addComponents(randombutton);

      let embed = new EmbedBuilder()
        .setColor("#2f3136")
        .setTitle(`Captcha Verification`)
        .setImage(`attachment://captcha.png`);
      let captchaImage = new AttachmentBuilder(await buffer, {
        name: "captcha.png",
      });
      let mainmsg = await interaction.editReply({
        embeds: [embed],
        files: [captchaImage],
        components: [row],
        ephemeral: true,
        fetchReply: true,
      });
      setTimeout(() => {
        interaction.deleteReply();
      }, 5000);
    } else if (interaction.customId == "whereami") {
      const data = await getUserPlacement(
        interaction.user.username,
        interaction.guild.id
      );
      interaction.reply({ content: data, ephemeral: true });
    }
  } catch (e) {
    console.log(e);
  }
};
