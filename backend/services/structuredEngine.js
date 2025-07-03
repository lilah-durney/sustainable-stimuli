//Core structured engine logic (Word2Vec, similiarty)
import keywordExtractor from "keyword-extractor";



function extractKeywords(prompt) {
    return keywordExtractor.extract(prompt, {
        language: "english", 
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: false
});

}


// searchInput format:
//       designBrief,
//       semanticDistance, 
//       visualSimilarity,
//       conceptualSimilarity,
//       sustainableGoal,
//       searchType,
//       outputTypes,

export async function processStructured(searchInput) {
    const prompt = searchInput.designBrief
    const keywords = extractKeywords(prompt)
    return({extractedWords: keywords })



}