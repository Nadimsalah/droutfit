const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function verifyModel(modelName) {
    const key = "AIzaSyDbL9NnjgGmPcn17mzMNUU8rLcYbl_0XPg";
    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log(`Verifying ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Return 'OK'");
        const text = result.response.text();
        console.log(`${modelName} Success:`, text);
        return true;
    } catch (e) {
        console.error(`${modelName} Failed:`, e.message);
        return false;
    }
}

async function runTests() {
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-2.0-flash-exp",
        "gemini-2.5-flash",
        "gemini-2.5-flash-image",
        "nano-banana-pro-preview"
    ];

    for (const model of candidates) {
        await verifyModel(model);
        console.log("---");
    }
}

runTests();
