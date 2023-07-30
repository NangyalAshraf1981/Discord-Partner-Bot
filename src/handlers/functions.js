const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const GuildSettings = require("../models/GuildSettings");
const UserSettings = require("../models/UserSettings");
const Panel = require("../models/panel");

module.exports = {
  shuffle,
  generateCaptcha,
  bumpLogic,
  getLeaderboard,
  getUserPlacement,
  nFormatter,
};

async function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function generateCaptcha() {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let captcha = "";

  for (let i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * characters.length);
    captcha += characters[randomIndex];
  }

  return captcha;
}

async function bumpLogic(client, interaction, invite, ephemeral) {
  try {
    let currentGuildId = interaction.guild.id;
    let messagesSent = 0; // Initialize the counter
    let guilds = client.guilds.cache;
    for (const [guildId, guild] of guilds) {
      if (guildId === currentGuildId) {
        continue;
      }
      try {
        await client.guilds.fetch(guild.id);
      } catch (error) {
        console.log(`No longer have access to ${guild.name}.`);
        continue;
      }
      const guildSettings = await GuildSettings.findOne({ guildId: guild.id });
      const currentGuildSettings = await GuildSettings.findOne({
        guildId: interaction.guild.id,
      });

      if (!guildSettings) {
        continue;
      }

      const partnerChannelId = guildSettings.partner;
      const lastbumpdate = guildSettings.lastBumpDate;
      const desc = currentGuildSettings ? currentGuildSettings.desc : "";

      if (!guild.channels.cache.has(partnerChannelId)) {
        continue;
      }

      const partnerChannel = guild.channels.cache.get(partnerChannelId);
      if (
        !partnerChannel
          .permissionsFor(guild.members.me)
          .has(PermissionFlagsBits.SendMessages) ||
        guild.members.me.isCommunicationDisabled()
      ) {
        await GuildSettings.deleteMany({ partnerChannelId, lastbumpdate });
        console.log(
          `Successfully Deleted Partner Channel: ${partnerChannel.name} from ${guild.name}`
        );
        continue;
      }
      const joinbtn = new ButtonBuilder()
        .setLabel("Join")
        .setURL(invite.url)
        .setStyle(ButtonStyle.Link);
      const row = new ActionRowBuilder().addComponents(joinbtn);
      const embed = new EmbedBuilder()
        .setTitle(interaction.guild.name)
        .setDescription(`${desc}`)
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

      try {
        await partnerChannel.send({ embeds: [embed], components: [row] });
        messagesSent++; // Increment the counter for each successfully sent message
      } catch (error) {
        console.log(
          `Failed to send message to the partner channel in guild ${guild.name}/${invite.url}.`
        );
        console.log(error);
        await GuildSettings.deleteOne({ partnerChannelId, lastbumpdate });
        console.log(`Partner Channel Deleted due to ${error}`);
      }
    }
    await interaction.followUp({
      content: `Bumped to ${messagesSent} guilds!`,
      ephemeral: ephemeral,
    });

    const userSettings = await UserSettings.findOne({
      guildId: interaction.guild.id,
      userId: interaction.user.id,
    });

    if (!userSettings) {
      const newUserSettings = new UserSettings({
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        username: interaction.user.username,
        usertag: interaction.user.tag,
      });
      await newUserSettings.save();
    } else {
      const updateBump = userSettings.bumps + 1;
      userSettings.bumps = updateBump;
      userSettings.username = interaction.user.username;
      userSettings.usertag = interaction.user.tag;
      await userSettings.save();
    }

    let panel = await Panel.findOne({ guildId: interaction.guild.id });
    if (!panel || !panel.panelChannelId) {
      console.log("Panel not found or panelChannelId is undefined.");
      return;
    }
    await panelupdater(panel, interaction);
  } catch (error) {
    console.log(`Error in bumpLogic: `, error);
  }
}

async function getLeaderboard(guildId) {
  try {
    const leaderboard = await UserSettings.find({ guildId })
      .sort({ bumps: -1 })
      .limit(10)
      .select("username bumps")
      .exec();

    let leaderboardString = "[2;34m##       BUMP      USER\n";
    let position = 0;
    leaderboard.forEach((entry, index) => {
      if (entry.username && entry.bumps) {
        position++;
        leaderboardString += `[2;33m${position}.[0m[2;34m[0m       ${entry.bumps
          .toString()
          .padEnd(10)}${entry.username}\n`;
      }
    });

    leaderboardString = "```ansi\n" + leaderboardString + "\n```";
    return leaderboardString;
  } catch (error) {
    console.error("Error retrieving leaderboard:", error);
  }
}
async function getUserPlacement(username, guildId) {
  try {
    // Retrieve the leaderboard entries for the specific guild, sorted by the highest bumps
    const leaderboard = await UserSettings.find({ guildId })
      .sort({ bumps: -1 }) // Sort in descending order (-1) based on 'bumps'
      .select("username bumps") // Include only 'username' and 'bumps' fields
      .exec();

    // Find the placement and bumps for the specified user
    const userEntry = leaderboard.find((entry) => entry.username === username);

    if (userEntry) {
      const placement =
        leaderboard.findIndex((entry) => entry.username === username) + 1;
      return { placement, bumps: userEntry.bumps };
    }
    return null;
  } catch (error) {
    console.error("Error retrieving user placement:", error);
  }
}

function nFormatter(num, digits) {
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const i = si.findIndex((x) => num < x.value);

  return (num / si[i - 1].value).toFixed(digits).replace(rx, "$1") + si[i - 1].symbol;
}
