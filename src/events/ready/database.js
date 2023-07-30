const chalk = require("chalk");
const mongoose = require("mongoose");
const GuildSettings = require("../../models/GuildSettings");
const User = require("../../models/UserSettings");
const AntiToxic = require("../../models/AntiToxic");
const Panel = require("../../models/panel");

module.exports = async (client) => {
  try {
    const guildIds = client.guilds.cache.map((guild) => guild.id);
    const guildSettings = await GuildSettings.find({
      guildId: { $in: guildIds },
    }).exec();
    const userSettings = await User.find({
      guildId: { $in: guildIds },
    }).exec();
    const antiToxic = await AntiToxic.find({
      guildId: { $in: guildIds },
    }).exec();
    const panel = await Panel.find({ guildId: { $in: guildIds } }).exec();

    const guildIdsToRemoveGuildSettings = guildSettings
      .filter((setting) => !guildIds.includes(setting.guildId))
      .map((setting) => setting.guildId);
    if (guildIdsToRemoveGuildSettings.length > 0) {
      await GuildSettings.deleteMany({
        guildId: { $in: guildIdsToRemoveGuildSettings },
      });
      console.log(
        `Removed ${guildIdsToRemoveGuildSettings.length} guilds from GuildSettings.`
      );
    }
    const guildIdsToRemoveUserSettings = userSettings
      .filter((setting) => !guildIds.includes(setting.guildId))
      .map((setting) => setting.guildId);
    if (guildIdsToRemoveUserSettings.length > 0) {
      await User.deleteMany({
        guildId: { $in: guildIdsToRemoveUserSettings },
      });
      console.log(
        `Removed ${guildIdsToRemoveUserSettings.length} guilds from UserSettings.`
      );
    }
    const guildIdsToRemoveAntiToxic = antiToxic
      .filter((setting) => !guildIds.includes(setting.guildId))
      .map((setting) => setting.guildId);
    if (guildIdsToRemoveAntiToxic.length > 0) {
      await AntiToxic.deleteMany({
        guildId: { $in: guildIdsToRemoveAntiToxic },
      });
      console.log(
        `Removed ${guildIdsToRemoveAntiToxic.length} guilds from AntiToxic.`
      );
    }
    const guildIdsToRemovePanel = panel
      .filter((setting) => !guildIds.includes(setting.guildId))
      .map((setting) => setting.guildId);
    if (guildIdsToRemovePanel.length > 0) {
      await Panel.deleteMany({ guildId: { $in: guildIdsToRemovePanel } });
      console.log(`Removed ${guildIdsToRemovePanel.length} guilds from Panel.`);
    }

    console.log(chalk.green("Database cleanup complete."));
  } catch (error) {
    console.error("Error during database cleanup:", error);
  }
};
