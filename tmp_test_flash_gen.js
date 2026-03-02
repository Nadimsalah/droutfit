const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function testFlashImage() {
    const key = "AIzaSyDbL9NnjgGmPcn17mzMNUU8rLcYbl_0XPg";
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = "Please try on this garment. Return only the final image.";
    const dummyImage = {
        inlineData: {
            data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            mimeType: "image/png"
        }
    };

    try {
        console.log("Testing gemini-2.5-flash image output...");
        const result = await model.generateContent([prompt, dummyImage, dummyImage]);

        let hasImage = false;
        if (result.response.candidates && result.response.candidates[0].content.parts) {
            for (const part of result.response.candidates[0].content.parts) {
                if (part.inlineData) {
                    hasImage = true;
                    console.log("SUCCESS: gemini-2.5-flash CAN output images!");
                }
            }
        }

        if (!hasImage) {
            console.log("NO IMAGE FOUND. gemini-2.5-flash is likely vision-only (input), not generative (output). Text response:", result.response.text());
        }

    } catch (e) {
        console.error("Test Failed:", e.message);
    }
}

testFlashImage();
