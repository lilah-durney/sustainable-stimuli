import openai from "../utils/openAIClient.js"

export async function convertImageToText(imageUrl) {
    const system_guidelines = `You are an assistant that helps designers apply sustainable design guidelines. 
        Given a sketch uploaded by the user, describe what is shown in the image. 
        Include key components, their arrangement, and the overall purpose or function of the design. 
        Use no more than 40 words. Return only the description—do not include any explanations, commentary, or formatting.` 

    

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
            content: [
                {
                    type: "image_url", 
                    image_url: {url: imageUrl}
                },
            ],
        },
        ],
    });

    const description = response.choices[0]?.message?.content?.trim();
    if (!description) {
        throw new Error("No content returned from OpenAI")
    }
    return description;

    } catch(err) {
        console.error("Failed to convert image to text:", err)
        throw new Error("Image-to-text conversion failed");
    }


}