//Core structured engine logic (Word2Vec, similiarty)
import keywordExtractor from "keyword-extractor";
import { loadGloveVectors, getVector, hasVector } from "./gloveLoader.js";
import fs from "fs";


function extractKeywords(prompt) {
   return keywordExtractor.extract(prompt, {
       language: "english",
       remove_digits: true,
       return_changed_case: true,
       remove_duplicates: false
});
}




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




export async function processStructured(searchInput, guidelineVectors) {
   const prompt = searchInput.designBrief
   const similiartyPref = Number(searchInput.semanticDistance)/100
   const keywords = extractKeywords(prompt)
   const promptVector = averageVector(keywords);
   console.log("promptVector:", promptVector);
   

   const fetchedGuideline = fetchGuideline(promptVector, guidelineVectors, similiartyPref);

   return({guideline: fetchedGuideline, extractedWords: keywords })

}
