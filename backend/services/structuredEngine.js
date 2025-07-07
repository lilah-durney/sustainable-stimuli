//Core structured engine logic (Word2Vec, similiarty)
import keywordExtractor from "keyword-extractor";
import { loadGloveVectors, getVector, hasVector } from "./gloveLoader";
import fs from "fs";

function extractKeywords(prompt) {
    return keywordExtractor.extract(prompt, {
        language: "english", 
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: false
});
}


function averageVector(words, getVector) {
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





export async function processStructured(searchInput) {
    const prompt = searchInput.designBrief
    const keywords = extractKeywords(prompt)
    const promptVector = averageVector(keywords);
    const guidelineVectors = app.locals.guidelineVectors;



   


    
    return({extractedWords: keywords })



}