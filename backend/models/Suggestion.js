import mongoose from "mongoose";
const { Schema, models } = mongoose;

const SuggestionSchema = new Schema({
  sessionId: {type: String},
  designBrief: { type: String },
  permanentUploadedImageUrl: { type: String }, 
  imageDescription: {type: String},
  semanticDistance: { type: Number }, 
  visualSimilarity: { type: Number},
  conceptualSimilarity: { type: Number},
  sustainableGoal: { type: String },
  searchType: { type: String, required: true },
  outputTypes: {
    Text: Boolean,
    Image: Boolean,
  },
  output: {
    guideline: String, 
    extractedWords: [String],
    category: String,
    explanation: String,
    suggestion: String, 
    similarityScore: Number,
    permanentGeneratedImageUrl: String,
    perQueryEmissions: {
      energyWh: Number,
      emissionsGrams: Number,

    } ,
  },
  createdAt: { type: Date, default: Date.now },
});

const Suggestion =
  models.Suggestion || mongoose.model("Suggestion", SuggestionSchema);
export default Suggestion;