const key = "AIzaSyDbL9NnjgGmPcn17mzMNUU8rLcYbl_0XPg";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function checkModels() {
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        console.log("Available models (v1beta):", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

checkModels();
