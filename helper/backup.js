const mysqldump = require("mysqldump"),
  { MongoClient } = require("mongodb"),
  fs = require("fs"),
  path = require("path"),
  { getBackupFilePath, getBackupDir, zipDirectory } = require(".");
const { exec } = require("child_process");
const { uploadToDrive } = require("./drive");

// Function to backup a MySQL database
async function backupMysqlDatabase(config, backupFilePath) {
  try {
    await mysqldump({
      connection: config.database, // MySQL connection config (e.g., { host, user, password, database })
      dumpToFile: backupFilePath,
    });

    uploadToDrive(config, backupFilePath, "application/sql");

    console.log(`Database backup completed successfully for ${config.name}`);
  } catch (error) {
    console.error("Error during database backup:", error);
  }
}

async function backupMongoDB(config, backupDir) {
  const { host, database, user, password } = config.database;
  let connectionString = `mongodb://${host}/${database}`;

  // Append user and password if provided
  if (user && password) {
    connectionString = `mongodb://${encodeURIComponent(
      user
    )}:${encodeURIComponent(password)}@${host}/${database}`;
  }

  if (config?.database?.uri && config.driver === "mongodb")
    connectionString = config.database.uri;

  try {
    await createMongoDBBackup(connectionString, backupDir);

    zipDirectory(backupDir, `${backupDir}.zip`).then((res) => {
      uploadToDrive(config, `${backupDir}.zip`, "application/zip");
    });

    console.log(`Database backup completed successfully for ${config.name}`);
  } catch (error) {
    console.error("Error during database backup:", error);
  }
}

function createMongoDBBackup(databaseURL, backupPath) {
  return new Promise((resolve, reject) => {
    const command = `mongodump --uri="${databaseURL}" --out="${backupPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating MongoDB backup: ${error.message}`);
        reject(error);
        return;
      }
      resolve(backupPath);
    });
  });
}

function backupDatabase(config) {
  switch (config.driver) {
    case "mysql":
      backupMysqlDatabase(config, `${getBackupFilePath(config)}.sql`);
      break;

    case "mongodb":
      backupMongoDB(config, getBackupDir(config));
      break;
  }
}

module.exports = {
  backupDatabase,
};
