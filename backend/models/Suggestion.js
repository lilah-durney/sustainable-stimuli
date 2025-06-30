import mongoose from "mongoose";
const { Schema, models } = mongoose;

const SuggestionSchema = new Schema({
  type: { type: String, required: true }, // "genAI" or "structured"
  suggestionId: { type: String, required: true }, // UUID
  designBrief: { type: String }, // design brief from user
  goalCategory: { type: String }, // sustainability goal
  semanticDistance: { type: String, enum: ["near", "medium", "far"] }, // might want to change this to a number scale instead (same for the similarities below)
  visualSimilarity: { type: String, enum: ["low", "high"] },
  conceptualSimilarity: { type: String, enum: ["low", "high"] },
  sketchUrl: { type: String }, //optional --> would this actually be the actualy image? in terms of object storage not sure yet
  output: {
    guideline: String, //for structured
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
