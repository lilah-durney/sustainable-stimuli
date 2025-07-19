import openai from "../utils/openAIClient.js";
import uploadToS3 from "../utils/uploadToS3.js";
import axios from "axios";

export async function generateImageFromSuggestion(suggestionText) {

//   const system_guidelines = `You are an assistant that generates early-stage design concept sketches to 
//   support sustainable product development.
  
//   You will receive:
//   1. A brief description of a user's original concept (what they are trying to design), and
//   2. A sustainability-oriented design suggestion they are considering.

//   Use both of these inputs to understand the context and generate a helpful visualization.

//   Generate a black and white line drawing of the described design. Use clean linework and minimal 
//   shading to convey shape, structure, material, and texture. The drawing should be in a sketch-style format with no color,
//   no background, and no photorealism.

//   You may include up to 4 views of the object (such as side view, front view, top view, cross section), but do not 
//   ever exceed 4 views total.

//   Prioritize clarity of functional and structural elements. Decorative features should only be included if necessary 
//   for understanding the design. Focus on communicating form, interaction, and sustainable design considerations.
// `
  // Step 1: Generate from OpenAI
  const openAIResponse = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Sketch of: ${suggestionText}. Line drawing, clean background.`,
    size: "1024x1024",
    response_format: "url",
  });

  const openAIUrl = openAIResponse.data[0].url;

  //Fetch the image from the OpenAI URL
  const imageBuffer = (await axios.get(openAIUrl, { responseType: "arraybuffer" })).data;

  const fakeFile = {
    originalname: "generated.png",
    mimetype: "image/png",
    buffer: Buffer.from(imageBuffer),
  };

  //Upload to S3
  const { key } = await uploadToS3(fakeFile, "uploads/generated-sketches");
  const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    openAIUrl, // for immediate frontend display
    s3Url,     // for persistent storage
  };
}
