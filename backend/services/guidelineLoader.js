import fs from "fs";
import keywordExtractor from "keyword-extractor";
import {getVector} from "./gloveLoader";
import path from "path";


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

export function loadGuidelineVectors(filePath) {
    const file = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(file)
    const vectorMap = new Map();

    

    for (const obj of data) {
        const keywords = extractKeywords(obj.guideline);
        const vector = averageVector(guidelineKeywords);
        if (vector) {
            vectorMap.set(obj.id, {
                ...obj, 
                vector,
            });
        }
    }

    return vectorMap;
    
}

