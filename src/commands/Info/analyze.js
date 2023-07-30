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

const Perspective = require("perspective-api-client");
const perspective = new Perspective({ apiKey: process.env.PERSPECTIVE_API });
module.exports = {
  data: new SlashCommandBuilder()
    .setName("analyze")
    .setDescription("Analyzes the text")
    .addStringOption((option) =>
      option
        .setName("attribute")
        .setDescription("Attribute to analyze")
        .setRequired(true)
        .addChoices(
          { name: "Toxicity", value: "toxicity" },
          { name: "Severe Toxicity", value: "severe_toxicity" },
          { name: "Identity Attack", value: "identity_attack" },
          { name: "Insult", value: "insult" },
          { name: "Profanity", value: "profanity" },
          { name: "Threat", value: "threat" }
        )
    )
    .addStringOption((option) =>
      option.setName("text").setDescription("Text to analyze").setRequired(true)
    ),

  async execute(client, interaction) {
    if (interaction.options.getString("attribute") == "toxicity") {
      try {
        const text = interaction.options.getString("text");
        const result = await perspective.analyze(text);
        let obj = JSON.parse(JSON.stringify(result));
        const embed = new EmbedBuilder()
          .setColor("#2f3136")
          .setAuthor({ name: `Toxicity Analyzer` })
          .setDescription(
            `Your message had a profanity level of \`\`\`${
              obj.attributeScores.TOXICITY.summaryScore.value * 100
            }%\`\`\``
          )
          .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              format: "png",
              size: 2048,
            }),
          })
          .setTimestamp();
        return interaction.reply({ embeds: [embed] });
      } catch (e) {
        console.log(e);
      }
    } else if (interaction.options.getString("attribute") == "profanity") {
      try {
        const text = interaction.options.getString("text");
        const result = await perspective.analyze(text, {
          attributes: ["profanity"],
        });
        let obj = JSON.parse(JSON.stringify(result));
        const embed = new EmbedBuilder()
          .setColor("#2f3136")
          .setAuthor({ name: `Profanity Analyzer` })
          .setDescription(
            `Your message had a profanity level of \`\`\`${
              obj.attributeScores.PROFANITY.summaryScore.value * 100
            }%\`\`\``
          )
          .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              format: "png",
              size: 2048,
            }),
          })
          .setTimestamp();
        return interaction.reply({ embeds: [embed] });
      } catch (e) {
        console.log(e);
      }
    } else if (interaction.options.getString("attribute") == "insult") {
      try {
        const text = interaction.options.getString("text");
        const result = await perspective.analyze(text, {
          attributes: ["insult"],
        });
        let obj = JSON.parse(JSON.stringify(result));
        const embed = new EmbedBuilder()
          .setColor("#2f3136")
          .setAuthor({ name: `Insult Analyzer` })
          .setDescription(
            `Your message had an insult level of \`\`\`${
              obj.attributeScores.INSULT.summaryScore.value * 100
            }%\`\`\``
          )
          .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              format: "png",
              size: 2048,
            }),
          })
          .setTimestamp();
        return interaction.reply({ embeds: [embed] });
      } catch (e) {
        console.log(e);
      }
    } else if (interaction.options.getString("attribute") == "threat") {
      try {
        const text = interaction.options.getString("text");
        const result = await perspective.analyze(text, {
          attributes: ["threat"],
        });
        let obj = JSON.parse(JSON.stringify(result));
        const embed = new EmbedBuilder()
          .setColor("#2f3136")
          .setAuthor({ name: `Threat Analyzer` })
          .setDescription(
            `Your message had a threat level of \`\`\`${
              obj.attributeScores.THREAT.summaryScore.value * 100
            }%\`\`\``
          )
          .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              format: "png",
              size: 2048,
            }),
          })
          .setTimestamp();
        return interaction.reply({ embeds: [embed] });
      } catch (e) {
        console.log(e);
      }
    } else if (
      interaction.options.getString("attribute") == "identity_attack"
    ) {
      try {
        const text = interaction.options.getString("text");
        const result = await perspective.analyze(text, {
          attributes: ["identity_attack"],
        });
        let obj = JSON.parse(JSON.stringify(result));
        const embed = new EmbedBuilder()
          .setColor("#2f3136")
          .setAuthor({ name: `Identity Attack Analyzer` })
          .setDescription(
            `Your message had an identity attack level of \`\`\`${
              obj.attributeScores.IDENTITY_ATTACK.summaryScore.value * 100
            }%\`\`\``
          )
          .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              format: "png",
              size: 2048,
            }),
          })
          .setTimestamp();
        return interaction.reply({ embeds: [embed] });
      } catch (e) {
        console.log(e);
      }
    } else if (
      interaction.options.getString("attribute") == "severe_toxicity"
    ) {
      try {
        const text = interaction.options.getString("text");
        const result = await perspective.analyze(text, {
          attributes: ["severe_toxicity"],
        });
        let obj = JSON.parse(JSON.stringify(result));
        const embed = new EmbedBuilder()
          .setColor("#2f3136")
          .setAuthor({ name: `Severe Toxicity Analyzer` })
          .setDescription(
            `Your message had a severe toxicity level of \`\`\`${
              obj.attributeScores.SEVERE_TOXICITY.summaryScore.value * 100
            }%\`\`\``
          )
          .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              format: "png",
              size: 2048,
            }),
          })
          .setTimestamp();
        return interaction.reply({ embeds: [embed] });
      } catch (e) {
        console.log(e);
      }
    }
  },
};
