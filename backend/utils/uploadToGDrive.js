import { getDriveClient } from "./googleDriveClient.js";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";
import { Readable } from "stream";

const FOLDER_ID = "1cgbHH7poEkRiTrDnP_ferQuzprWwKtHz";

export default async function uploadToGDrive(file, prefix = "uploads") {
  if (!file.mimetype.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  const drive = await getDriveClient();
  const fileName = `${prefix}/${uuidv4()}_${file.originalname}`;
  const bufferStream = Readable.from(file.buffer);

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
  const emails = ["ldurney@berkeley.edu", "goridkov@berkeley.edu","codesign-lab@berkeley.edu"];

  for (const email of emails) {
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
