import mongoose from "mongoose";
const { Schema, models } = mongoose;

const SuggestionSchema = new Schema({
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