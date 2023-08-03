const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const {
  convertYamlToJsObject,
  validateConfigObject,
  getJobsFullPath,
} = require("./helper");
const { backupDatabase } = require("./helper/backup");

global.__rootDir = path.resolve(__dirname);

fs.readdirSync("./jobs").forEach((file) => {
  const config = convertYamlToJsObject(getJobsFullPath(file));

  if (validateConfigObject(config)) {
    try {
      cron.schedule(config.schedule, () => backupDatabase(config));
      console.log(
        `Cron job "${config.name}" scheduled with schedule: "${config.schedule}"`
      );
    } catch (error) {
      console.error(
        `Error scheduling cron job "${config.name}":`,
        error.message
      );
    }
  }
});
