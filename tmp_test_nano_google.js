const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function testNanoModel() {
    const key = "AIzaSyDbL9NnjgGmPcn17mzMNUU8rLcYbl_0XPg";
    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log("Testing models/gemini-2.5-flash-image...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const result = await model.generateContent("Test prompt. Return 'READY'.");
        console.log("Success with gemini-2.5-flash-image:", result.response.text());
    } catch (e) {
        console.error("Error with gemini-2.5-flash-image:", e.message);
    }

    try {
        console.log("\nTesting models/nano-banana-pro-preview...");
        const model = genAI.getGenerativeModel({ model: "nano-banana-pro-preview" });
        const result = await model.generateContent("Test prompt. Return 'READY'.");
        console.log("Success with nano-banana-pro-preview:", result.response.text());
    } catch (e) {
        console.error("Error with nano-banana-pro-preview:", e.message);
    }
}

testNanoModel();
