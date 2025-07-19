import s3 from "./awsClient.js";
import { v4 as uuidv4 } from "uuid";
import {
  GetObjectCommand,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function uploadToS3(file, prefix = "uploads") {
  if (!file.mimetype.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  const key = `${prefix}/${uuidv4()}_${file.originalname}`;

  const putParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(putParams));

  //Generate presigned URL for temporary access (for OpenAI vision)
  const getCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3, getCommand, { expiresIn: 300 });

  return {
    key,
    signedUrl,
  };
}
