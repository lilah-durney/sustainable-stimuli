import { getDriveClient } from "./googleDriveClient.js";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";
import { Readable } from "stream";


//FolderIds for GDrive
const DEFAULT_FALLBACK_FOLDER_ID = "1cgbHH7poEkRiTrDnP_ferQuzprWwKtHz";
const UPLOADED_SKETCHES_FOLDER_ID = "1_402ihb29-Ccb5Zs100BQ9hRVV2vnZH_";
const GENERATED_SKETCHES_FOLDER_ID = "1P2gw1LotcdBrs5Pr0dabXkae9rF0Z9pL";

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
