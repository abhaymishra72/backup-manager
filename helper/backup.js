const mysqldump = require("mysqldump"),
  { MongoClient } = require("mongodb"),
  fs = require("fs"),
  path = require("path"),
  { getBackupFilePath, getBackupDir } = require(".");

// Function to backup a MySQL database
async function backupMysqlDatabase(databaseDetails, backupFilePath) {
  try {
    await mysqldump({
      connection: databaseDetails, // MySQL connection config (e.g., { host, user, password, database })
      dumpToFile: backupFilePath,
    });

    console.log(
      `Database backup completed successfully. Backup saved to: ${backupFilePath}`
    );
  } catch (error) {
    console.error("Error during database backup:", error);
  }
}

async function backupMongoDB(databaseDetails, backupDir) {
  const { host, database, user, password } = databaseDetails;
  let connectionString = `mongodb://${host}/${database}`;

  // Append user and password if provided
  if (user && password) {
    connectionString = `mongodb://${encodeURIComponent(
      user
    )}:${encodeURIComponent(password)}@${host}/${database}`;
  }

  const client = new MongoClient(connectionString);

  try {
    await client.connect();

    const db = client.db(database);

    // Get the list of collections in the database
    const collections = await db.listCollections().toArray();

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Dump each collection to separate files
    for (const collection of collections) {
      const collectionName = collection.name;
      const collectionFilePath = path.join(backupDir, `${collectionName}.json`);

      const collectionData = await db
        .collection(collectionName)
        .find()
        .toArray();
      const jsonData = JSON.stringify(collectionData, null, 2);

      fs.writeFileSync(collectionFilePath, jsonData, "utf8");
    }

    console.log("Database backup completed successfully.");
  } catch (error) {
    console.error("Error during database backup:", error);
  } finally {
    client.close();
  }
}

function backupDatabase(config) {
  switch (config.driver) {
    case "mysql":
      backupMysqlDatabase(config.database, `${getBackupFilePath(config)}.sql`);
      break;

    case "mongodb":
      console.log("mongodb called");
      backupMongoDB(config.database, getBackupDir(config));
      break;
  }
}

module.exports = {
  backupDatabase,
};
