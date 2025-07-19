import keywordExtractor from "keyword-extractor";

export function extractKeywords(prompt) {
  return keywordExtractor.extract(prompt, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: false,
  });
}
