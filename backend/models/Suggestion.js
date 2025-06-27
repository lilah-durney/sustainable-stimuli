import mongoose from "mongoose";
const {Schema, models} = mongoose

const SuggestionSchema = new Schema({
  type: { type: String, required: true }, // "genAI" or "non-genAI"
  suggestionId: { type: String, required: true }, // UUID or custom
  design_brief: { type: String},
  goal_category: { type: String},
  semantic_distance: { type: String, enum: ["near", "medium", "far"]},
  visual_similarity: { type: String, enum: ["low", "high"]},
  conceptual_similarity: { type: String, enum: ["low", "high"] },
  sketch_url: { type: String }, // optional
  output: {
    guideline: String, // for non-genAI
    suggestion: String, // for genAI
    rationale: String,
    category: String,
    source_guideline: String, // for genAI
    similarity_score: Number // for non-genAI
  },
  energy_used: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const Suggestion = models.Suggestion || mongoose.model("Suggestion", SuggestionSchema);
export default Suggestion;
