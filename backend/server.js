// Entry point to start the server
import express from "express";
import cors from "cors";
import mongoose from "mongoose"
import suggestionRoutes from "./routes/suggestions.js";
import { loadGloveVectors } from "./services/gloveLoader.js";
import { loadGuidelineVectors } from "./services/guidelineLoader.js";
import fs from "fs";


import dotenv from "dotenv";
dotenv.config();



const app = express();
app.use(cors());
app.use(express.json());

//Load guidelines. 
const guidelineFile = fs.readFileSync("data/guidelines.json", "utf8");
const guidelines = JSON.parse(guidelineFile);
const guidelineList = guidelines
  .map((g, i) => `${i + 1}. ${g.guideline} (${g.category})`)
  .join("\n");

app.locals.guidelineList = guidelineList;

//Load GloVe and guideline vectors.
await loadGloveVectors("data/glove.6B.100d.txt");
const guidelineMap = loadGuidelineVectors("data/guidelines.json");
app.locals.loadGuidelineVectors = guidelineMap;




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
