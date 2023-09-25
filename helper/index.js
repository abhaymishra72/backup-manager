const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");
const archiver = require("archiver");


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
      // console.log(`Directory created: ${directoryPath}`);
    } else {
      // console.log(`Directory already exists: ${directoryPath}`);
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

  const backup_dir = `${backupPath}/${name}_${driver}_${date.getFullYear()}_${date
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

function cronToReadable(cronExpression) {
  const parts = cronExpression.split(" ");

  if (parts.length !== 5) {
    return "Invalid cron expression";
  }

  const minute = parts[0];
  const hour = parts[1];
  const dayOfMonth = parts[2];
  const month = parts[3];
  const dayOfWeek = parts[4];

  // Convert cron fields to human-readable format
  const minuteText =
    minute === "*" ? "every minute" : `every ${minute} minute(s)`;
  const hourText = hour === "*" ? "every hour" : `at ${hour} o'clock`;
  const dayOfMonthText =
    dayOfMonth === "*" ? "every day" : `on day ${dayOfMonth}`;
  const monthText = month === "*" ? "every month" : `in ${month}`;
  const dayOfWeekText =
    dayOfWeek === "*" ? "every day of the week" : `on ${dayOfWeek}`;

  return `${minuteText}, ${hourText}, ${dayOfMonthText}, ${monthText}, ${dayOfWeekText}`;
}

function zipDirectory(sourceDir, outputZip) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputZip);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Set the compression level (0-9)
    });

    output.on("close", () => {
      resolve(outputZip);
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    archive.directory(sourceDir, false); // Add the entire directory to the archive

    archive.finalize();
  });
}



module.exports = {
  getBackupFilePath,
  checkAndCreateDir,
  convertYamlToJsObject,
  validateConfigObject,
  getJobsFullPath,
  getBackupDir,
  cronToReadable,
  zipDirectory,
};
