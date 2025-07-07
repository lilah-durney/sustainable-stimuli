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










export async function processStructured(searchInput, guidelineVectors) {
   const prompt = searchInput.designBrief
   const keywords = extractKeywords(prompt)
   const promptVector = averageVector(keywords);
  


   console.log("promptVector:", promptVector)


   //TODO: loop over my guidelineVEctors, caluclate the cosineSimiliarty between
   //prompt vector and each guidelineVector, return the correct guideline based on
   //simliiarty/whatveer the user specified.


 




  
   return({extractedWords: keywords })






}
