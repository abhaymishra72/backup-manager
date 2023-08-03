const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");

function convertYamlToJsObject(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    return yaml.load(fileContents);
  } catch (error) {
    console.error("Error reading or parsing YAML file:", error.message);
    return null;
  }
}

// Function to check if a directory exists, and create a new one if it doesn't exist
function checkAndCreateDir(directoryPath) {
  try {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
      console.log(`Directory created: ${directoryPath}`);
    } else {
      console.log(`Directory already exists: ${directoryPath}`);
    }
  } catch (error) {
    console.error("Error checking or creating directory:", error.message);
  }
}

function getBackupFilePath({ name, driver }) {
  const date = new Date();
  let backupPath = `${__rootDir}/backup/${name}`;

  checkAndCreateDir(backupPath);
  return `${backupPath}/${driver}_${date.getFullYear()}_${date
    .getMonth()
    .toString()
    .padStart(2, "0")}_${date
    .getDate()
    .toString()
    .padStart(2, "0")}_${date.getTime()}`;
}

function getBackupDir({ name, driver }) {
  const date = new Date();
  let backupPath = `${__rootDir}/backup/${name}`;
  checkAndCreateDir(backupPath);

  const backup_dir = `${backupPath}/${driver}_${date.getFullYear()}_${date
    .getMonth()
    .toString()
    .padStart(2, "0")}_${date
    .getDate()
    .toString()
    .padStart(2, "0")}_${date.getTime()}`;

  checkAndCreateDir(backup_dir);
  return backup_dir;
}

function validateConfigObject(obj) {
  // Check if the object has the required properties

  if (
    !obj.name ||
    !obj.driver ||
    !obj.schedule ||
    !obj.database ||
    !obj.database.host ||
    !obj.database.database
  ) {
    console.log("Required params are missing.");
    return false;
  }

  if (obj.driver === "mysql" && obj.user && obj.user == "") return false;

  // Check if the driver is one of the valid options (mysql, mongodb, etc.)
  const validDrivers = ["mysql", "mongodb"];
  if (!validDrivers.includes(obj.driver)) {
    console.log("Unknown driver");
    return false;
  }

  // Check if the schedule is a valid cron expression
  // const cronPattern =
  //   /^(\*|\d{1,2}(-\d{1,2})?)(,\s*(\*|\d{1,2}(-\d{1,2})?))*\s+(\*|\d{1,2}(-\d{1,2})?)(,\s*(\*|\d{1,2}(-\d{1,2})?))*\s+(\*|\d{1,2}(-\d{1,2})?)(,\s*(\*|\d{1,2}(-\d{1,2})?))*\s+(\*|\d{1,2}(-\d{1,2})?)(,\s*(\*|\d{1,2}(-\d{1,2})?))*$/;
  // if (!cronPattern.test(obj.config.schedule)) {
  //   console.log("Invalid schedule found");
  //   return false;
  // }

  // Check if the notification property exists and is an array
  if (
    obj.notification &&
    (!Array.isArray(obj.notification) || obj.notification.length === 0)
  ) {
    console.log("Invalid notifications");
    return false;
  }

  // Additional checks can be added for password requirements if needed

  // If all validations pass, the object is considered valid
  return true;
}

function getJobsFullPath(file) {
  return `${__rootDir}/jobs/${file}`;
}

module.exports = {
  getBackupFilePath,
  checkAndCreateDir,
  convertYamlToJsObject,
  validateConfigObject,
  getJobsFullPath,
  getBackupDir,
};
