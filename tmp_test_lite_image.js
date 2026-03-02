const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function testLiteImage() {
    const key = "AIzaSyDbL9NnjgGmPcn17mzMNUU8rLcYbl_0XPg";
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = "Please try on this garment. Return only the final image.";

    // We use dummy small base64 for testing if the model even tries to output image data
    const dummyImage = {
        inlineData: {
            data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            mimeType: "image/png"
        }
    };

    try {
        console.log("Testing gemini-2.5-flash-lite image output...");
        const result = await model.generateContent([prompt, dummyImage, dummyImage]);

        console.log("Response Candidates:", JSON.stringify(result.response.candidates, null, 2));

        const text = result.response.text();
        console.log("Response Text:", text);

        let hasImage = false;
        if (result.response.candidates && result.response.candidates[0].content.parts) {
            for (const part of result.response.candidates[0].content.parts) {
                if (part.inlineData) {
                    hasImage = true;
                    console.log("Found inlineData image!");
                }
            }
        }

        if (!hasImage) {
            console.log("NO IMAGE FOUND in response.");
        }

    } catch (e) {
        console.error("Test Failed:", e);
    }
}

testLiteImage();
