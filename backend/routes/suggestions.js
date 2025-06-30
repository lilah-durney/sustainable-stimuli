//All /api/suggestions routes (non-genAI & genAI)
import express from "express";
import Suggestion from "../models/Suggestion.js";
import {v4 as uuidv4} from "uuid";

const router = express.Router();

router.post("/structured", async (req,res) => {
  try {
    const suggestionId = uuidv4(); //unique Id generated for tracking
    const suggestion = new Suggestion({
      ...req.body,
      suggestionId,
      createdAt: new Date(),
    });

    //Saves new document to database
    await suggestion.save()
    //Sending the document to the frontend
    res.status(200).json({suggestionId, output: suggestion.output});
  } catch(error) {
    console.error("Error saving structured suggestion:", error)
    res.status(500).json({error: "Failed to save suggestion"})
  }
});

export default router;