import openai from "../utils/openAIClient.js"

export async function convertImageToText(buffer) {
    const system_guidelines = `You are an assistant that helps designers apply sustainable design guidelines. 
        Given a sketch uploaded by the user, describe what is shown in the image. 
        Include key components, their arrangement, and the overall purpose or function of the design. 
        Use no more than 40 words. Return only the description—do not include any explanations, commentary, or formatting.` 
    
        const base64Image = buffer.toString("base64")
    

    try {
        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: [
                {
                    role: "user",
                    content: [
                        { type: "input_text", text: system_guidelines },
                        {
                            type: "input_image",
                            image_url: `data:image/jpeg;base64,${base64Image}`
                        }
                    ] 
                }
            ],
        });

    const description = response.output_text;
    console.log("Ddesc")
    if (!description) {
        throw new Error("No content returned from OpenAI")
    }
    return description;

    } catch(err) {
        console.error("Failed to convert image to text:", err)
        throw new Error("Image-to-text conversion failed");
    }


}