import { getDriveClient } from "./googleDriveClient.js";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";
import { Readable } from "stream";


//FolderIds for GDrive
const DEFAULT_FALLBACK_FOLDER_ID = process.env.DEFAULT_FALLBACK_FOLDER_ID;
const UPLOADED_SKETCHES_FOLDER_ID = process.env.UPLOADED_SKETCHES_FOLDER_ID;
const GENERATED_SKETCHES_FOLDER_ID = process.env.GENERATED_SKETCHES_FOLDER_ID;

export default async function uploadToGDrive(file, prefix) {
  if (!file.mimetype.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  let FOLDER_ID = "";
  const drive = await getDriveClient();
  const fileName = `${prefix}/${uuidv4()}_${file.originalname}`;
  const bufferStream = Readable.from(file.buffer);

  if (prefix == "uploaded-sketches") {
    FOLDER_ID = UPLOADED_SKETCHES_FOLDER_ID;

  } else if (prefix == "generated-sketches") {
    FOLDER_ID = GENERATED_SKETCHES_FOLDER_ID;
  } else {
    FOLDER_ID = DEFAULT_FALLBACK_FOLDER_ID; //Default folder, just here in case of an error (nothing should be getting saved here anymore)
  }
 
  //Upload the file
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: file.mimetype,
      parents: [FOLDER_ID],
    },
    media: {
      mimeType: file.mimetype,
      body: bufferStream,
    },
    supportsAllDrives: true,
    fields: "id, webViewLink",
  });

  //Permissions for who can view images directly through URL
  const authorizedEmails = process.env.AUTHORIZED_EMAILS?.split(",") || [];

  for (const email of authorizedEmails) {
    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: {
        type: "user",
        role: "reader",
        emailAddress: email,
      },
      supportsAllDrives: true,
      sendNotificationEmail: false,
    });
  }

  return {
    fileId: res.data.id,
    webViewLink: res.data.webViewLink,
  };
}
