//Core structured engine logic (Word2Vec, similiarty)
import keywordExtractor from "keyword-extractor";
import { loadGloveVectors, getVector, hasVector } from "./gloveLoader.js";
import fs from "fs";
import { extractKeywords } from "../utils/extractKeywords.js";
import { measureStructuredEmissions, addEmissions } from "./measureEmissions.js";



function averageVector(words) {
   const vectors = words
       .map(getVector)
       .filter(x => x !== undefined);
    
    if (vectors.length === 0) {
        throw new Error("None of the extracted keywords have corresponding vectors in the pre-trained set.");
    }
  
   const sum = new Array(vectors[0].length).fill(0)
  
   for (let vec of vectors) {
       for (let i=0; i<vec.length; i++) {
           sum[i] += vec[i]
       }


   }


   return sum.map(x => x / vectors.length);


}


function cosineSimliarity(vecA, vecB) {
   if (vecA.length !== vecB.length) {
       throw new Error("Vectors must be the same length");
   }


   let dotProduct = 0;
   let normA = 0;
   let normB = 0;


   for (let i = 0; i< vecA.length; i++) {
       dotProduct += vecA[i] * vecB[i];
       normA += vecA[i] * vecA[i];
       normB += vecB[i] * vecB[i];


   }


   normA = Math.sqrt(normA);
   normB = Math.sqrt(normB);




   //Avoid division by zero
   if (normA === 0 || normB===0) {
       return 0;
   }


   return dotProduct / (normA * normB);


}





function fetchGuideline(promptVector, guidelineVectors, similarityPref) {
  const guidelinesWithScores = [];

  for (let [guidelineId, guidelineObj] of guidelineVectors) {
    if (!guidelineObj.vector) {
      console.warn("Missing vector for guideline:", guidelineObj.guideline);
      continue;
    }

    const similarity = cosineSimliarity(promptVector, guidelineObj.vector);
    guidelinesWithScores.push({ guideline: guidelineObj.guideline, similarity });
  }

  if (guidelinesWithScores.length === 0) {
    throw new Error("No guideline vectors available for comparison.");
  }

  //Sort by similarity (descending = most similar first)
  guidelinesWithScores.sort((a, b) => b.similarity - a.similarity);

  //Index based on user's similiarityPreference
  const index = Math.floor(similarityPref * (guidelinesWithScores.length - 1));
  console.log(guidelinesWithScores[index])
  return guidelinesWithScores[index].guideline;
}




export async function processStructured(searchInput, guidelineVectors, emissions) {
  const start = process.hrtime();
  
  
  //Build the user message content based on whether or not they included sketch or text. 

  let promptKeywords = [];
  const designBrief = searchInput.designBrief;
  if (designBrief) {
    const designBriefKeywords = extractKeywords(designBrief);
    promptKeywords.push(...designBriefKeywords);
  } 

  const imageDescription = searchInput.imageDescription;
  if (imageDescription) {
    const imageDescriptionKeywords = extractKeywords(imageDescription);
    promptKeywords.push(...imageDescriptionKeywords)
  }

  if (promptKeywords == []){
    throw new Error("User input is empty — must provide a design brief or upload a sketch.");
  }
    


  const promptVector = averageVector(promptKeywords);

  const similiartyPref = Number(searchInput.semanticDistance)/100
   

  console.log("promptVector:", promptVector);
   

  const fetchedGuideline = fetchGuideline(promptVector, guidelineVectors, similiartyPref);

  const structuredEmissions = measureStructuredEmissions(start);

  console.log(`Structured engine energy: ${structuredEmissions.energyWh.toFixed(6)} Wh`);
  console.log(`Structured engine emissions: ${structuredEmissions.emissionsGrams.toFixed(6)} g CO₂`);


  return({guideline: fetchedGuideline, extractedWords: promptKeywords, emissions: addEmissions(emissions, structuredEmissions)})

}

