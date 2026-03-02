const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
    const key = "AIzaSyDbL9NnjgGmPcn17mzMNUU8rLcYbl_0XPg";
    const genAI = new GoogleGenerativeAI(key);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent("Test.");
        console.log("Success with gemini-2.0-flash-lite:", result.response.text());
    } catch (e) {
        console.error("Error with gemini-2.0-flash-lite:", e.message);
    }
}

listModels();
