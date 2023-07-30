const chalk = require("chalk");
module.exports = (client, rateLimitData) => {
  console.log(chalk.grey(JSON.stringify(rateLimitData)));
};
