import { google } from "googleapis";
import { readFileSync } from "fs";

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});




export async function getDriveClient() {
  console.log("Using key file at:", process.env.GOOGLE_APPLICATION_CREDENTIALS)
  const authClient = await auth.getClient();
  return google.drive({ version: "v3", auth: authClient });
}
