import mongoose from "mongoose";
const { Schema, models } = mongoose;

const SuggestionSchema = new Schema({
  designBrief: { type: String }, // design brief from user
  permanentUploadedImageUrl: { type: String }, //optional 
  imageDescription: {type: String},
  semanticDistance: { type: Number }, 
  visualSimilarity: { type: Number},
  conceptualSimilarity: { type: Number},
  sustainableGoal: { type: String }, // sustainability goal
  searchType: { type: String, required: true }, // "genAI" or "structured"
  outputTypes: {
    Text: Boolean,
    Image: Boolean,
  },
  output: {
    guideline: String, //for both
    extractedWords: [String], //for structured
    category: String, //for genAI only for now
    explanation: String, //genAI
    suggestion: String, //genAI
    similarityScore: Number, // for structured
    permanentGeneratedImageUrl: String,
    estimatedEmissions: {
      energyUsed: Number,
      emissionsGrams: Number,

    } ,
  },
  energyUsed: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const Suggestion =
  models.Suggestion || mongoose.model("Suggestion", SuggestionSchema);
export default Suggestion;