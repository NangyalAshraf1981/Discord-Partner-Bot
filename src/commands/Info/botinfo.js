const Discord = require("discord.js");
const ms = require("pretty-ms");
const os = require("os");

module.exports = {
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  data: {
    name: "info",
    description: "Replies with the bot info!",
  },

  async execute(client, interaction) {
    let date = Date.now();
    await interaction.deferReply();
    //const shardID = interaction.guild.shardId || '0'
    await interaction.editReply({
      embeds: [
        new Discord.EmbedBuilder()
          .setTitle(`Bot Information of ${interaction.client.user?.tag}`)
          .setColor("#2f3136")
          .addFields(
            {
              name: "Guilds:",
              value: `> \`\`${interaction.client.guilds.cache.size}\`\``,
              inline: true,
            },
            {
              name: "Users:",
              value: `> \`\`${interaction.client.users.cache.size}\`\``,
              inline: true,
            },
            {
              name: "Channels:",
              value: `> \`\`${interaction.client.channels.cache.size}\`\``,
              inline: true,
            },
            {
              name: "Commands:",
              value: `> \`\`${client.commands.size}\`\``,
              inline: true,
            },
            {
              name: "Uptime:",
              value: `> \`\`${ms(interaction.client.uptime, {
                long: true,
              })}\`\``,
              inline: true,
            },
            {
              name: "Ping:",
              value: `> \`\`${Math.round(interaction.client.ws.ping)}ms\`\``,
              inline: true,
            },
            {
              name: "Cluster:",
              value: `> \`\`${client.cluster.id}\`\``,
              inline: true,
            },
            {
              name: "Commands:",
              value: `> \`\`${client.commands.size}\`\``,
              inline: true,
            },
            {
              name: "Memory:",
              value: `> \`\`${(
                process.memoryUsage().heapUsed /
                900 /
                900
              ).toFixed(2)}MB\`\``,
              inline: true,
            },
            {
              name: "Node:",
              value: `> \`\`${process.version}\`\``,
              inline: true,
            },
            {
              name: "Discord.js:",
              value: `> \`\`${Discord.version}\`\``,
              inline: true,
            },
            {
              name: "OS:",
              value: `> \`\`${process.platform}\`\``,
              inline: true,
            },
            {
              name: "CPU:",
              value: `> \`\`${os.cpus()[0].model}\`\``,
              inline: true,
            },
            {
              name: "CPU Cores:",
              value: `> \`\`${os.cpus().length}\`\``,
              inline: true,
            },
            {
              name: "CPU Speed:",
              value: `> \`\`${os.cpus()[0].speed}MHz\`\``,
              inline: true,
            }
          )
          .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              format: "png",
              size: 2048,
            }),
          }),
      ],
    });
  },
};
