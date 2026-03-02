const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listAllModels() {
    const key = "AIzaSyDbL9NnjgGmPcn17mzMNUU8rLcYbl_0XPg";
    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log("Listing all available models for this API key...");
        // Note: The Node SDK might not have a direct listModels but we can try the REST call or check if it exists
        // Actually, listing models is usually a GET to /v1beta/models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            data.models.forEach(m => {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(", ")})`);
            });
        } else {
            console.log("No models found or error in response:", data);
        }
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listAllModels();
