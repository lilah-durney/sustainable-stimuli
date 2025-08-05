import express from "express";
import multer from "multer";
import Suggestion from "../models/Suggestion.js";
import SessionLog from "../models/SessionLog.js";
import { processStructured } from "../services/structuredEngine.js";
import { processGenAI } from "../services/genAIEngine.js";
import { convertImageToText } from "../services/convertImageToText.js";
import { generateImageFromSuggestion } from "../services/generateImageFromSuggestion.js";
import uploadToGDrive from "../utils/uploadToGDrive.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/upload", upload.single("sketchFile"), async (req, res) => {
  try {
    const {
      designBrief,
      semanticDistance,
      visualSimilarity,
      conceptualSimilarity,
      sustainableGoal,
      searchType,
    } = req.body;

    const rawOutputTypes = req.body.outputTypes || {};
    const outputTypes = {
      Text: rawOutputTypes.Text === "true",
      Image: rawOutputTypes.Image === "true",
    };

    let permanentUploadedImageUrl = null;
    let imageDescription = null;
    let perQueryEmissions = {energyWh: 0, emissionsGrams:0};

    if (req.file) {
      const { webViewLink } = await uploadToGDrive(req.file, "uploaded-sketches");
      const result = await convertImageToText(req.file.buffer, perQueryEmissions);
      imageDescription = result.description;
      perQueryEmissions = result.emissions;
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

    await searchInput.save();

    const guidelineVectors = req.app.locals.loadGuidelineVectors;
    const guidelineList = req.app.locals.guidelineList;

    let replicateImageUrl = null;
    let processedOutput = {};
    if (searchType === "Structured") {
      const result = await processStructured(searchInput, guidelineVectors, perQueryEmissions);
      processedOutput.guideline = result.guideline;
      processedOutput.extractedWords = result.extractedWords;
      perQueryEmissions = result.emissions;
    } else {
      const result = await processGenAI(searchInput, guidelineList, perQueryEmissions);
      processedOutput.guideline = result.guideline;
      processedOutput.category = result.category;
      processedOutput.explanation = result.explanation;
      processedOutput.suggestion = result.suggestion;
      perQueryEmissions = result.emissions;

      if (outputTypes.Image) {
        const result = await generateImageFromSuggestion(searchInput, processedOutput.suggestion, perQueryEmissions);
        replicateImageUrl = result.replicateImageUrl;
        processedOutput.permanentGeneratedImageUrl = result.webViewLink;
        perQueryEmissions = result.emissions;
      }
    }

    console.log("energyWh:",perQueryEmissions.energyWh )
    console.log("emissionsGrams:", perQueryEmissions.emissionsGrams)

    processedOutput.perQueryEmissions = {
      energyWh: perQueryEmissions.energyWh,
      emissionsGrams: perQueryEmissions.emissionsGrams,
    };

    console.log("processedOutput:", processedOutput)

    const sessionId = req.body.sessionId;
    let session = await SessionLog.findOne({ sessionId });
    
    const deltaEnergy = Number(perQueryEmissions.energyWh) || 0;
    const deltaGrams = Number(perQueryEmissions.emissionsGrams) || 0;

    
    if (session) {
      session.totalEnergyWh += deltaEnergy;
      session.totalEmissionsGrams += deltaGrams;
      await session.save();
    } else {
      await SessionLog.create({
        sessionId,
        totalEnergyWh: deltaEnergy,
        totalEmissionsGrams: deltaGrams,
        lastUpdated: Date.now(),
      });
      session = await SessionLog.findOne({sessionId});

    }




    searchInput.output = processedOutput;
    await searchInput.save();
    console.log("Saved suggestion:", searchInput);

    res.status(200).json({ 
      output: processedOutput, 
      replicateImageUrl,   
      sessionTotals: {
            totalEnergyWh: session.totalEnergyWh,
            totalEmissionsGrams: session.totalEmissionsGrams
        },
      });
  } catch (error) {
    if (error.message.includes("corresponding vectors")) {
      console.warn("Input could not be processed — prompt too unfamiliar or too niche.");
    }
    console.error("Error saving search:", error);
    res.status(500).json({ error: error.message || "Failed to save search" });
  }
});

router.get("/session-summary", async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId. Please try again" });
  }

  try {
    const session = await SessionLog.findOne({ sessionId });
    if (!session) {
      return res.json({ totalEnergyWh: 0, totalEmissionsGrams: 0 });
    }

    res.status(200).json({
      totalEnergyWh: session.totalEnergyWh || 0,
      totalEmissionsGrams: session.totalEmissionsGrams || 0,
    });
  } catch (err) {
    console.error("Error fetching session summary", err);
    res.status(500).json({ error: "Failed to fetch session summary" });
  }
});

export default router;
