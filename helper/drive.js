require("dotenv").config();
const { create } = require("domain");
const fs = require("fs");
const { google } = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL ?? "";
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN ?? "";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

async function saveInDrive(name, file, type, parentFolderId) {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: name,
        mimeType: type,
        parents: parentFolderId ? [parentFolderId] : [],
      },
      media: {
        mimeType: type,
        body: fs.createReadStream(file),
      },
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function createFolderIfNotExists(folderName, parentFolderId = null) {
  try {
    // Check if the folder already exists within the parent folder (if provided)
    let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`;
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
    });

    if (response.data.files.length > 0) {
      // Folder already exists
      // console.log(`Folder '${folderName}' already exists.`);
      return response.data.files[0];
    } else {
      // Folder doesn't exist, create it within the parent folder (if provided)
      const folderMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentFolderId ? [parentFolderId] : [], // Set parent folder ID if provided
      };

      const createdFolder = await drive.files.create({
        resource: folderMetadata,
        fields: "id",
      });

      // console.log(`Folder '${folderName}' created.`);
      return createdFolder.data;
    }
  } catch (error) {
    console.error(`Error creating folder '${folderName}':`, error);
    throw error;
  }
}

function generateFileName(prefix) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Generate the file name with the specified prefix and the current date and time
  const fileName = `${prefix}_${year}-${month}-${day}_${hours}${minutes}${seconds}`;

  return fileName;
}

async function uploadToDrive(config, file, type) {
  const bm_folder = await createFolderIfNotExists("BM-Pro_backups");
  const mFolder = await createFolderIfNotExists(config.name, bm_folder.id);
  saveInDrive(
    generateFileName(`${config.name}_${config.driver}`),
    file,
    type,
    mFolder.id
  );
}

module.exports = {
  uploadToDrive,
};
