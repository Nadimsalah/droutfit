const key = "AIzaSyDbL9NnjgGmPcn17mzMNUU8rLcYbl_0XPg";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function listAllModels() {
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        console.log("Model List Summary:");
        data.models.forEach(m => {
            console.log(`- ${m.name} (${m.displayName}) | Methods: ${m.supportedGenerationMethods.join(', ')}`);
        });
    } catch (e) {
        console.error("List models failed:", e);
    }
}

listAllModels();
