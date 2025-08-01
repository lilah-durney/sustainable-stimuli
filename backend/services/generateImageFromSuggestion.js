import uploadToGDrive from "../utils/uploadToGDrive.js";
import axios from "axios";
import Replicate from "replicate";
import { measureReplicateEmissions, addEmissions } from "./measureEmissions.js";



const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
})

function describeConceptualSimilarity(conceptualSimilarity) {
  if (conceptualSimilarity < 33) {
    return `Low conceptual similarity, very conceptually different from the description of the user's image`
  } else if (conceptualSimilarity > 66) {
    return `High conceptual simlarity, conceptually very simliar to the description of the user's image`
  } else {
     return `Medium conceptual simlarity, conceptually somewhat simliar to the description of the user's image`

  }
}

function describeVisualSimilarity(visualSimilarity) {
  if (visualSimilarity < 33) {
    return `Low visual similarity, very visually different from the description of the user's image.`
  } else if (visualSimilarity > 66) {
    return  `High visual similarity, visually very similar to the description of the user's image`
  } else {
    return `Medium visual similarity, visually somewhat similiar to the description of the user's image`
  }
}

export async function generateImageFromSuggestion(searchInput, suggestionText, emissions) {
  try {
    let originalConcept = "";

    if (searchInput.designBrief && searchInput.imageDescription) {
      const conceptualSimilarity = describeConceptualSimilarity(searchInput.conceptualSimilarity);
      const visualSimilarity = describeVisualSimilarity(searchInput.visualSimilarity);

      originalConcept = `Design brief: ${searchInput.designBrief}, Uploaded image description: ${searchInput.imageDescription},
      Conceptual similarity: ${conceptualSimilarity}, Visual similarity: ${visualSimilarity}`;
    } else if (searchInput.designBrief) {
      originalConcept = `Design brief: ${searchInput.designBrief}`;
    } else if (searchInput.imageDescription) {
      const conceptualSimilarity = describeConceptualSimilarity(searchInput.conceptualSimilarity); // fixed typo here
      const visualSimilarity = describeVisualSimilarity(searchInput.visualSimilarity);

      originalConcept = `Uploaded image description: ${searchInput.imageDescription}, 
      Conceptual similarity: ${conceptualSimilarity}, Visual similarity: ${visualSimilarity}`;
    } else {
      throw new Error("User input is empty — must provide a design brief or upload a sketch.");
    }

    //Combine user concept and generated suggestion into structured visual prompt. 
    const prompt = `
      ${originalConcept}, ${suggestionText}, black and white, line drawing, 
      clear functionality, structural elements, minimal shading, no color, no background, product sketch, industrial design, 
      isometric view, clean contour lines, cross-section, side view, top view`;

    //Generate from Replicate
    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: prompt,
          aspect_ratio: "16:9",
          num_outputs: 1,
          style_preset: "sketch",
          negative_prompt: "color, photo-realistic, clutter, blurry",
          seed: 20,
        },
      }
    );

    const replicateImageUrl = output.url();

    //Download the image
    const imageBuffer = (await axios.get(replicateImageUrl, { responseType: "arraybuffer" })).data;

    const fakeFile = {
      originalname: "generated.png",
      mimetype: "image/png",
      buffer: Buffer.from(imageBuffer),
    };

    //Try uploading to Google Drive
    let webViewLink = null;
    try {
      const uploadResult = await uploadToGDrive(fakeFile, "generated-sketches");
      webViewLink = uploadResult.webViewLink;
    } catch (uploadErr) {
      console.warn("Failed to upload to Google Drive:", uploadErr.message || uploadErr);
    }

    const imageGenEmissions = measureReplicateEmissions(1);

    return {
      replicateImageUrl,  // for immediate frontend display
      webViewLink,          // to save to drive
      emissions: addEmissions(emissions,imageGenEmissions)
    };

  } catch (err) {
    console.error("Image generation error:", err);
    throw new Error("Image generation failed. Please check inputs or try again later.");
  }
}
