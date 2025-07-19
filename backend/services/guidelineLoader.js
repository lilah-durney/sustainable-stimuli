import fs from "fs";
import keywordExtractor from "keyword-extractor";
import {getVector} from "./gloveLoader.js";
import path from "path";
import { extractKeywords } from "../utils/extractKeywords.js";









function averageVector(words) {
   const vectors = words.map(getVector).filter(x => x !== undefined);
  
   const sum = new Array(vectors[0].length).fill(0)
  
   for (let vec of vectors) {
       for (let i=0; i<vec.length; i++) {
           sum[i] += vec[i]
       }


   }


   return sum.map(x => x / vectors.length);


}


export function loadGuidelineVectors(filePath) {
   const file = fs.readFileSync(filePath, "utf8");
   const data = JSON.parse(file)
   const vectorMap = new Map();


  


   for (const obj of data) {
       const keywords = extractKeywords(obj.guideline);
       const vector = averageVector(keywords);
       if (vector) {
           vectorMap.set(obj.id, {
               ...obj,
               vector,
           });
       }
   }


   return vectorMap;
  
}




