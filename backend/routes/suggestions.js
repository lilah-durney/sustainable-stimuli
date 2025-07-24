//All /api/suggestions routes (non-genAI & genAI)
import express from "express";
import Suggestion from "../models/Suggestion.js";
import {v4 as uuidv4} from "uuid";
import multer from "multer";
import { processStructured } from "../services/structuredEngine.js";
import { processGenAI } from "../services/genAIEngine.js";
import { convertImageToText } from "../services/convertImageToText.js";
import {generateImageFromSuggestion} from "../services/generateImageFromSuggestion.js"
import uploadToGDrive from "../utils/uploadToGDrive.js";


const upload = multer({storage: multer.memoryStorage()});
const router = express.Router()




router.post("/upload", upload.single("sketchFile"), async (req,res) => {
 console.log("Body:", req.body)
 console.log("File:", req.file)
  try {
   const {
     designBrief,
     semanticDistance,
     visualSimilarity,
     conceptualSimilarity,
     sustainableGoal,
     searchType
   } = req.body


   console.log("Parsed req.body keys:", Object.keys(req.body));

   const rawOutputTypes = req.body.outputTypes || {};
   const outputTypes = {
      Text: rawOutputTypes.Text === "true",
      Image: rawOutputTypes.Image === "true",
    };

   
   let permanentUploadedImageUrl = null;
   let imageDescription = null;
   

   if (req.file) {
    const { webViewLink } = await uploadToGDrive(req.file, "uploads/user-sketches");

    //Use buffer directly to get image description
    imageDescription = await convertImageToText(req.file.buffer);

    //Save permanent Google Drive link
    permanentUploadedImageUrl = webViewLink;

    
   }


   const searchInput = new Suggestion({
     designBrief,
     semanticDistance,
     visualSimilarity,
     conceptualSimilarity,
     sustainableGoal,
     searchType,
     outputTypes,
     permanentUploadedImageUrl,
     imageDescription,
   });


   //Saves initial input to database
   await searchInput.save()


   const guidelineVectors = req.app.locals.loadGuidelineVectors;
   const guidelineList = req.app.locals.guidelineList;




   //Process depending on engine type.
   let replicateImageUrl = null;
   let processedOutput = {};
   if (searchType === "Structured") {
     processedOutput = await processStructured(searchInput, guidelineVectors);
   } else {
      processedOutput = await processGenAI(searchInput, guidelineList);

  
      console.log("SEARCH INPUT NOW:", searchInput)

    
    
      if (outputTypes.Image) {
          console.log("Going to generate image");
          const result = await generateImageFromSuggestion(searchInput, processedOutput.suggestion);

          replicateImageUrl = result.replicateImageUrl;
          processedOutput.permanentGeneratedImageUrl = result.webViewLink;

      }
   }

   //Updates output to database.
  searchInput.output = processedOutput;
  await searchInput.save()
  console.log("Saved suggestion:", searchInput)
  
   //Sending the output to the frontend
   res.status(200).json({output: processedOutput, replicateImageUrl});
 } catch (error) {
  if (error.message.includes("corresponding vectors")) {
    console.warn("Input could not be processed — prompt too unfamiliar or too niche.");
  }
  console.error("Error saving search:", error);
  res.status(500).json({ error: error.message || "Failed to save search" });
}

});


export default router;




