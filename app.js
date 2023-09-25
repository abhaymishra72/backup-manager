require("dotenv").config();
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const {
  convertYamlToJsObject,
  validateConfigObject,
  getJobsFullPath,
  cronToReadable,
} = require("./helper");

const { backupDatabase } = require("./helper/backup");

global.__rootDir = path.resolve(__dirname);

fs.readdirSync("./jobs").forEach((file) => {
  const config = convertYamlToJsObject(getJobsFullPath(file));

  if (validateConfigObject(config)) {
    try {
      cron.schedule(config.schedule, () => backupDatabase(config));
      console.log(
        `Backup scheduled for "${config.name}" at: "${cronToReadable(
          config.schedule
        )}"`
      );
    } catch (error) {
      console.error(
        `Error scheduling backup "${config.name}":`,
        error.message
      );
    }
  }
});
