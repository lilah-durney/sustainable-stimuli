//Prompt construction & OpenAI API call
import fs from "fs";
import openai from "../utils/openAIClient.js";
import { measureOpenAIEmissions, measureStructuredEmissions, addEmissions } from "./measureEmissions.js";


export async function processGenAI(searchInput, guidelineList, emissions) {
  const system_guidelines = `
        You are an assistant that helps designers apply sustainable design guidelines.

        The user will give you either:
        1. A design concept that they're working on, and they want to make it more sustainable. 
        2. A description of a sketch they've uploaded. 
        3. Both a design concept and a description of a sketch they've uploaded.

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

  // Build the user message content based on whether or not they included sketch or text. 
  let userInput = "";
  const designBrief = searchInput.designBrief;
  const imageDescription = searchInput.imageDescription;

  //Start time to calculate overhead structured emissions.
  const start = process.hrtime()


  if (designBrief && imageDescription) {
    userInput = `Design brief: ${designBrief}\n\nSketch description: ${imageDescription}`;
  } else if (designBrief) {
    userInput = `Design brief: ${designBrief}`;
  } else if (imageDescription) {
    userInput = `Sketch description: ${imageDescription}`;
  } else {
    throw new Error("User input is empty — must provide a design brief or upload a sketch.");
  }

  console.log("User input:", userInput);

  let raw;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: system_guidelines,
        },
        {
          role: "user",
          content: userInput,
        }
      ]
    });

    raw = response.choices[0].message.content;
  } catch (err) {
    console.error("OpenAI API error:", err);
    throw new Error("AI model failed to generate a response. Please try again later.");
  }

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const structuredEmissions = measureStructuredEmissions(start);
    const promptEmissions = measureOpenAIEmissions("gpt-4o", 1);


    return {
      guideline: parsed.guideline,
      category: parsed.category,
      explanation: parsed.explanation,
      suggestion: parsed.suggestion,
      emissions: addEmissions(addEmissions(structuredEmissions, promptEmissions), emissions),
    };
  } catch (err) {
    console.error("Failed to parse GPT response:", raw);
    throw new Error("AI response was not valid JSON. Please rephrase your input or try again.");
  }
}
