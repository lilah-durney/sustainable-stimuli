//All /api/suggestions routes (non-genAI & genAI)
import express from "express";
import Suggestion from "../models/Suggestion.js";
import {v4 as uuidv4} from "uuid";
import multer from "multer";

const upload = multer({storage: multer.memoryStorage()});
const router = express.Router()


//Temp placeholders for now
async function processStructured(inputDoc) {
  return {guideline:"some guideline"};
}

async function processGenAI(inputDoc) {
  return {guideline: "some guideline"};
}


router.post("/upload", upload.single("sketchFile"), async (req,res) => {
  console.log("Body:", req.body)
  console.log("File:", req.file)
  
  try {
    const suggestionId = uuidv4(); //unique Id generated for tracking
    const {
      designBrief, 
      semanticDistance,
      visualSimilarity,
      conceptualSimilarity,
      sustainableGoal,
      searchType
    } = req.body

    const outputTypes = {
      Text: req.body["outputTypes[Text]" === "true"],
      Image: req.body["outputTypes[Image]" === "true"],
    };


    //TODO: handle image saving
    const sketchFile = req.file;

    const searchInput = new Suggestion({
      designBrief,
      semanticDistance, 
      visualSimilarity,
      conceptualSimilarity,
      sustainableGoal,
      searchType,
      outputTypes,
      // TODO: save sketchUrl once I've uploaded the image to storage
      // sketchUrl,
    });

    //Saves new document to database
    await searchInput.save()

    //Branch off processing logic based on searchType
    //TODO: processStructured/GenAI functions will be located in services/ folder
    let processedOutput = {};
    if (searchType === "Structured") {
      processedOutput = await processStructured(searchInput);
    } else {
      processedOutput = await processGenAI(searchInput);
    }

    //Updates output to database.
   searchInput.output = processedOutput;
   await searchInput.save()
   console.log("Saved suggestion:", searchInput)
    
    //Sending the output to the frontend
    res.status(200).json({output: processedOutput});
  } catch(error) {
    console.error("Error saving search:", error)
    res.status(500).json({error: "Failed to save search"})
  }
});

export default router;

