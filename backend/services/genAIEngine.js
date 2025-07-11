//Prompt construction & OpenAI API call

import OpenAI from "openai";
import fs from "fs";
import openai from "./openAIClient.js"





export async function processGenAI(searchInput, guidelineList) {
   const system_guidelines = `
        You are an assistant that helps designers apply sustainable design guidelines.

        The user will give you a design concept that they're working on, and they want to make it more sustainable. 
        Your job is to select one relevant guideline from the list below and respond in strict JSON format.

        Guidelines:
        ${guidelineList}

        Format your entire response as a JSON object with the following structure:

        {
        "guideline": "The selected guideline (as a string)",
        "category": "The guideline's category (as a string)",
        "explanation": "A short 2-3 sentence explanation of why this guideline is appropriate (max 30 words)",
        "suggestion": "A specific, actionable way the user can apply this guideline (2-3 sentences, max 30 words)"
        }

        Only return a JSON object. Do not include any commentary, markdown, or extra text.
    `;

    const prompt = searchInput.designBrief

    
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: system_guidelines,
      },
      {
        role: "user",
        content: prompt,
      }
    ]
  });


  const raw = response.choices[0].message.content;

    try {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return {
            guideline: parsed.guideline,
            category: parsed.category,
            explanation: parsed.explanation,
            suggestion: parsed.suggestion
        };
    } catch (err) {
        console.error("Failed to GPT response:", raw);
        throw new Error("AI response was not valid JSON");
    }
  
  
}

    
