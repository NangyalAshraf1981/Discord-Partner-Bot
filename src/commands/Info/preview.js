const {
  Client,
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const GuildSettings = require("../../models/GuildSettings"); // Import the GuildSettings model

module.exports = {
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  data: new SlashCommandBuilder()
    .setName("preview")
    .setDescription("preview server ad")
    .setDMPermission(false),

  async execute(client, interaction) {
    try {
      await interaction.deferReply();
      const guildSettings = await GuildSettings.findOne({
        guildId: interaction.guild.id,
      });
      if (!guildSettings.partner)
        return interaction.reply({
          content: " The Server hasnt been setup-ed yet.",
        });
      const invite = await interaction.guild.channels.cache
        .get(guildSettings.partner)
        .createInvite();
      const joinbtn = new ButtonBuilder()
        .setLabel("Join")
        .setURL(invite.url)
        .setStyle(ButtonStyle.Link);
      const row = new ActionRowBuilder().addComponents(joinbtn);
      const embed = new EmbedBuilder()
        .setTitle(interaction.guild.name)
        .setDescription(`${guildSettings.desc}`)
        .setImage(guildSettings.image || null)
        .setColor("#2f3136")
        .addFields({
          name: `Members: \`${interaction.guild.memberCount}\``,
          value: `Online: \`${
            interaction.guild.presences.cache.filter(
              (p) => p.status === "online"
            ).size
          }\` | Idle: \`${
            interaction.guild.presences.cache.filter((p) => p.status === "idle")
              .size
          }\` | DnD: \`${
            interaction.guild.presences.cache.filter((p) => p.status === "dnd")
              .size
          }\``,
          inline: false,
        })
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({
          text: `Bumped by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({
            dynamic: true,
            format: "png",
            size: 2048,
          }),
        });
      await interaction.editReply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
    } catch (e) {
      console.log(e);
    }
  },
};
