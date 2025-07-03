import mongoose from "mongoose";
const { Schema, models } = mongoose;

const SuggestionSchema = new Schema({
  designBrief: { type: String }, // design brief from user
  sketchUrl: { type: String }, //optional 
  semanticDistance: { type: Number }, // might want to change this to a number scale instead (same for the similarities below)
  visualSimilarity: { type: Number},
  conceptualSimilarity: { type: Number},
  sustainableGoal: { type: String }, // sustainability goal
  searchType: { type: String, required: true }, // "genAI" or "structured"
  output: {
    guideline: String, //for structured
    extractedWords: [String], //for structured
    suggestion: String, //for genAI
    rationale: String,
    category: String,
    sourceGuideline: String, // for genAI
    similarityScore: Number, // for structured
  },
  energyUsed: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const Suggestion =
  models.Suggestion || mongoose.model("Suggestion", SuggestionSchema);
export default Suggestion;