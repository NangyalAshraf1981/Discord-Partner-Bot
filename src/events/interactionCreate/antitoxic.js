const AntiToxic = require("../../models/AntiToxic");
const {
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  Events,
  TextInputStyle,
} = require("discord.js");

module.exports = async (client, interaction) => {
  try {
    if (interaction.customId === "enable") {
      let antiToxic = await AntiToxic.findOne({
        guildId: interaction.guild.id,
      });
      if (!antiToxic) {
        antiToxic = new AntiToxic({
          guildId: interaction.guild.id,
          antitoxic: true,
        });
      }
      antiToxic.antitoxic = true;
      await antiToxic.save();
      interaction.reply("Anti Toxic is now enabled.");
    } else if (interaction.customId === "disable") {
      let antiToxic = await AntiToxic.findOne({
        guildId: interaction.guild.id,
      });
      if (!antiToxic) {
        antiToxic = new AntiToxic({
          guildId: interaction.guild.id,
          antitoxic: false,
        });
      }
      antiToxic.antitoxic = false;
      await antiToxic.save();
      interaction.reply("Anti Toxic is now disabled.");
    } else if (interaction.customId === "logchl") {
      const modal = new ModalBuilder()
        .setTitle("Log Channel Input")
        .setCustomId("logchl_modal");

      const logChannelInput = new TextInputBuilder()
        .setCustomId("logchl_modal_input")
        .setLabel("Log Channel:")
        .setStyle(TextInputStyle.Short);

      let antiToxic = await AntiToxic.findOne({
        guildId: interaction.guild.id,
      });

      if (!antiToxic) {
        antiToxic = new AntiToxic({ guildId: interaction.guild.id });
      }

      if (antiToxic.logchannel) {
        logChannelInput.setValue(antiToxic.logchannel.toString());
      }

      const firstActionRow = new ActionRowBuilder().addComponents(
        logChannelInput
      );
      modal.addComponents(firstActionRow);
      interaction.showModal(modal);
    } else if (interaction.customId === "threshold") {
      const modal = new ModalBuilder()
        .setTitle("Threshold Input")
        .setCustomId("threshold_modal");

      const thresholdInput = new TextInputBuilder()
        .setCustomId("threshold_modal_input")
        .setLabel("Threshold:")
        .setStyle(TextInputStyle.Short);

      let antiToxic = await AntiToxic.findOne({
        guildId: interaction.guild.id,
      });

      if (!antiToxic) {
        antiToxic = new AntiToxic({ guildId: interaction.guild.id });
      }

      if (antiToxic.threshold) {
        thresholdInput.setValue(antiToxic.threshold.toString());
      }

      const firstActionRow = new ActionRowBuilder().addComponents(
        thresholdInput
      );
      modal.addComponents(firstActionRow);
      interaction.showModal(modal);
    } else if (interaction.customId === "threshold_modal") {
      const threshold = interaction.fields.getTextInputValue(
        "threshold_modal_input"
      );
      if (isNaN(threshold))
        return interaction.reply("Sorry, the threshold can only be a number.");
      if (threshold > 100)
        return interaction.reply("Sorry, the threshold cannot be above 100.");

      let antiToxic = await AntiToxic.findOne({
        guildId: interaction.guild.id,
      });
      if (!antiToxic) {
        antiToxic = new AntiToxic({
          guildId: interaction.guild.id,
          threshold: threshold,
        });
      }
      antiToxic.threshold = threshold;
      await antiToxic.save();
      interaction.reply(
        `Successfully saved threshold: \`\`${antiToxic.threshold}\`\`.`
      );
    } else if (interaction.customId === "logchl_modal") {
      const logChannel =
        interaction.fields.getTextInputValue("logchl_modal_input");
      if (isNaN(logChannel))
        return interaction.reply(
          "Sorry, the log channel can only be a number."
        );
      if (!interaction.guild.channels.cache.has(logChannel)) {
        return interaction.reply({
          content: "Invalid Channel ID.",
          ephemeral: true,
        });
      }
      let antiToxic = await AntiToxic.findOne({
        guildId: interaction.guild.id,
      });
      if (!antiToxic) {
        antiToxic = new AntiToxic({
          guildId: interaction.guild.id,
          logchannel: logChannel,
        });
      }
      antiToxic.logchannel = logChannel;
      await antiToxic.save();
      interaction.reply(
        `Successfully saved log channel: \`\`${antiToxic.logchannel}\`\`.`
      );
    }
  } catch (error) {
    console.log(error);
  }
};
