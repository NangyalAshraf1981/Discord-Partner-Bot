const {
  Client,
  Message,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const AntiToxic = require("../../models/AntiToxic");
const UserSettings = require("../../models/UserSettings");
const Perspective = require("perspective-api-client");
const perspective = new Perspective({ apiKey: process.env.PERSPECTIVE_API });

/**
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  try {
    if (!message.inGuild() || message.author.bot) return;
    if (message.member.permissions.has(PermissionFlagsBits.Administrator))
      return;

    let antiToxic = await AntiToxic.findOne({ guildId: message.guild.id });
    if (!antiToxic) return;
    if (!antiToxic.antitoxic) return
    let userSettings = await UserSettings.findOne({
      guildId: message.guild.id,
      userId: message.author.id,
    });
    if (!userSettings) {
      userSettings = new UserSettings({
        guildId: message.guild.id,
        userId: message.author.id,
      });
      userSettings.save();
    }

    const increment = userSettings.warns + 1;
    if (!antiToxic.antitoxic) return; // Check if antiToxic is null

    const result = await perspective.analyze(message.content);
    const integer = Math.round(
      result.attributeScores.TOXICITY.summaryScore.value * 100
    );

    if (integer >= antiToxic.threshold) {
      message.delete();
      userSettings.warns = increment;
      userSettings.save();

      let embed = new EmbedBuilder()
        .setColor("#2f3136")
        .setAuthor({ name: `Toxicity Detected` })
        .setDescription(
          `** ${message.author.username}**,\nYour message in ${message.guild.name} has been deleted due to its \`\`${integer}%\`\` toxicity. We kindly request that you refrain from using toxic language in the future. \n\n Here are the details of your message: \n> Content: ||${message.content}||`
        );

      let warns = new ButtonBuilder()
        .setCustomId("idc")
        .setLabel(`Offense: ${userSettings.warns}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const row = new ActionRowBuilder().setComponents(warns);

      await message.author.send({ embeds: [embed], components: [row] });
      if (!antiToxic.logchannel) return;

      let embed2 = new EmbedBuilder()
        .setColor("#2f3136")
        .setAuthor({ name: `Toxicity Detected` })
        .setDescription(
          `**Author : ** <@${message.author?.id}> - *${message.author?.tag}*\n**Channel : ** <#${message.channel?.id}> - *${message.channel?.name}*\n\n**Toxicity Level : **\n\`\`\`\n${integer}%\n\`\`\`**Message : **\n\`\`\`\n${message.content}\n\`\`\``
        )
        .setFooter({
          text: `Triggered by ${message.author.username}`,
          iconURL: message.author.displayAvatarURL({
            dynamic: true,
            format: "png",
            size: 2048,
          }),
        })
        .setTimestamp();

      const chl = await client.channels.fetch(antiToxic.logchannel);
      let buttonlink = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/channels/${message.guild.id}/${message.channel.id}`
        )
        .setLabel(`Go to #${message.channel.name}`);
      let row2 = new ActionRowBuilder().setComponents(buttonlink);
      const logmsg = await chl.send({ embeds: [embed2], components: [row2] });

      if (userSettings.warns % 5 === 0) {
        const timeoutDuration = userSettings.warns * 100000; // Timeout duration in milliseconds
        message.member.timeout(timeoutDuration);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
