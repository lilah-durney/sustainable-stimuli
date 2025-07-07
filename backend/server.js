// Entry point to start the server
import express from "express";
import cors from "cors";
import mongoose from "mongoose"
import dotenv from "dotenv";
import suggestionRoutes from "./routes/suggestions.js";
dotenv.config();
import { loadGloveVectors } from "./services/gloveLoader.js";
import { loadGuidelineVectors } from "./services/guidelineLoader.js";


const app = express();
app.use(cors());
app.use(express.json());


//Load GloVe and guidelines
await loadGloveVectors("data/glove.6B.100d.txt");
const guidelineMap = loadGuidelineVectors("data/guidelines.json");
app.locals.loadGuidelineVectors = guidelineMap;
console.log("guidelineMap:", guidelineMap)






app.use("/api/suggestions", suggestionRoutes);


const PORT = 4000;


mongoose
 .connect(process.env.MONGODB_URI)
 .then(() => {
   console.log("Connected to MongoDB");
   app.listen(PORT, () => {
     console.log(`Server running on http://localhost:${PORT}`);
   });
 })
 .catch(err => console.error("MongoDB connection error:", err));




 app.get("/", (req, res) => {
   res.send("API is running!")
 })
