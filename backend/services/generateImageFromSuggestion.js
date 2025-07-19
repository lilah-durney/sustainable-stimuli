import openai from "../utils/openAIClient.js";
import uploadToS3 from "../utils/uploadToS3.js";
import axios from "axios";
import Replicate from "replicate";



const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
})






export async function generateImageFromSuggestion(originalConcept, suggestionText) {


  //Comine user concept and generated suggestion into structured visual prompt. 
  const prompt = `
    ${originalConcept}, ${suggestionText}, black and white, line drawing, 
    clear functionality, structural elements, minimal shading, no color, no background, product sketch, industrial design, 
    isometric view, clean contour lines, cross-section, side view, top view`

  //Generate from Replicate
    const output = await replicate.run(
    "black-forest-labs/flux-1.1-pro",
  {
      input: {
        prompt: prompt,
        width: 1024,
        height: 1024,
        num_outputs: 1,
        style_preset: "sketch",
        negative_prompt: "color, photo-realistic, clutter, blurry",
        seed: 20,
      },
    }
  );

  const replicateImageUrl = output.url()

  //Download the image
  const imageBuffer = (await axios.get(replicateImageUrl, { responseType: "arraybuffer" })).data;

  const fakeFile = {
    originalname: "generated.png",
    mimetype: "image/png",
    buffer: Buffer.from(imageBuffer),
  };

  //Upload to S3
  const { key } = await uploadToS3(fakeFile, "uploads/generated-sketches");
  const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    replicateImageUrl, // for immediate frontend display
    s3Url,     // for persistent storage
  };
}
