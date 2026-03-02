const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function test31Image() {
    const key = "AIzaSyDbL9NnjgGmPcn17mzMNUU8rLcYbl_0XPg";
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });

    const prompt = "Please try on this garment. Return only the final image.";
    const dummyImage = {
        inlineData: {
            data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            mimeType: "image/png"
        }
    };

    try {
        console.log("Testing gemini-3.1-flash-image-preview output...");
        const result = await model.generateContent([prompt, dummyImage, dummyImage]);

        let hasImage = false;
        if (result.response.candidates && result.response.candidates[0].content.parts) {
            for (const part of result.response.candidates[0].content.parts) {
                if (part.inlineData) {
                    hasImage = true;
                    console.log("SUCCESS: gemini-3.1-flash-image-preview CAN output images!");
                }
            }
        }

        if (!hasImage) {
            console.log("NO IMAGE FOUND. Text response:", result.response.text());
        }

    } catch (e) {
        console.error("Test Failed:", e.message);
    }
}

test31Image();
