import { google } from "googleapis";

export async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  const authClient = await auth.getClient();
  return google.drive({ version: "v3", auth: authClient });
}
