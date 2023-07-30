const { Client, Message } = require("discord.js");
/**
 *
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (!message.inGuild() || message.author.bot) return;
  if (message.content.includes(`<@${client.user.id}>`)) {
    return message.reply(`Hi there,\n> Please use [/] Commands`);
  }
};
