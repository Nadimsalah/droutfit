const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function inspectResponse() {
    const key = "AIzaSyDbL9NnjgGmPcn17mzMNUU8rLcYbl_0XPg";
    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log("Testing models/gemini-2.5-flash-image with full inspection...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

        // This is a dummy prompt to see structure
        const result = await model.generateContent("Analyze the relationship between these two imaginary items. Return structure.");

        console.log("Response Object Keys:", Object.keys(result.response));
        console.log("Candidates:", JSON.stringify(result.response.candidates, null, 2));

        // Check for inlineData (images) in parts
        if (result.response.candidates && result.response.candidates[0].content.parts) {
            result.response.candidates[0].content.parts.forEach((part, i) => {
                console.log(`Part ${i} Keys:`, Object.keys(part));
                if (part.inlineData) {
                    console.log(`Part ${i} has inlineData (mimetype: ${part.inlineData.mimeType})`);
                }
                if (part.text) {
                    console.log(`Part ${i} Text:`, part.text);
                }
            });
        }
    } catch (e) {
        console.error("Error during inspection:", e);
    }
}

inspectResponse();
