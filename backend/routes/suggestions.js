import express from "express";
import Suggestion from "../models/Suggestion.js";
import multer from "multer";
import { processStructured } from "../services/structuredEngine.js";
import { processGenAI } from "../services/genAIEngine.js";
import { convertImageToText } from "../services/convertImageToText.js";
import {generateImageFromSuggestion} from "../services/generateImageFromSuggestion.js"
import uploadToGDrive from "../utils/uploadToGDrive.js";


const upload = multer({storage: multer.memoryStorage()});
const router = express.Router()


router.post("/upload", upload.single("sketchFile"), async (req,res) => {
  try {
   const {
     designBrief,
     semanticDistance,
     visualSimilarity,
     conceptualSimilarity,
     sustainableGoal,
     searchType
   } = req.body

   const rawOutputTypes = req.body.outputTypes || {};
   const outputTypes = {
      Text: rawOutputTypes.Text === "true",
      Image: rawOutputTypes.Image === "true",
    };

   let permanentUploadedImageUrl = null;
   let imageDescription = null;
   let emissions = 0;
   
   if (req.file) {
    const { webViewLink } = await uploadToGDrive(req.file, "uploaded-sketches");

    //Use buffer directly to get image description
    const result =  await convertImageToText(req.file.buffer, emissions);
    imageDescription = result.description
    emissions = result.emissions;

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

   //Save initial input to database
   await searchInput.save()

   const guidelineVectors = req.app.locals.loadGuidelineVectors;
   const guidelineList = req.app.locals.guidelineList;


   //Process depending on engine type.
   let replicateImageUrl = null;
   let processedOutput = {};
   if (searchType === "Structured") {
     const result = await processStructured(searchInput, guidelineVectors, emissions);
     
     processedOutput.guideline = result.guideline
     processedOutput.extractedWords = result.extractedWords
     emissions = result.emissions;

   } else {
      const result = await processGenAI(searchInput, guidelineList, emissions);

      processedOutput.guideline = result.guideline;
      processedOutput.category = result.category;
      processedOutput.explanation = result.explanation;
      processedOutput.suggestion = result.suggestion;

      emissions = result.emissions;


      if (outputTypes.Image) {
          const result = await generateImageFromSuggestion(searchInput, processedOutput.suggestion, emissions);

          replicateImageUrl = result.replicateImageUrl;
          processedOutput.permanentGeneratedImageUrl = result.webViewLink;
          emissions = result.emissions;
      }
   }

  processedOutput.estimatedEmissions = {
    energyWh: emissions.energyWh,
    emissionsGrams: emissions.emissionsGrams,
  };

   //Updates output to database.
  searchInput.output = processedOutput;
  await searchInput.save()
  console.log("Saved suggestion:", searchInput)
  
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




