const https = require('https');

async function testPrunaModel(modelName) {
  console.log(`Testing model: ${modelName}`);
  const fetch = require('node-fetch'); // Use dynamic import or node 18 fetch
}

// Since fetch is global in node 18+
async function run() {
  const apiKey = "pru_AdE9f0Zx_wZMX8GJzqQjGvcB5CizoY5G";
  const res = await fetch("https://api.pruna.ai/v1/predictions", {
    method: "POST",
    headers: {
      "apikey": apiKey,
      "Content-Type": "application/json",
      "Model": "flux-2-klein-4b"
    },
    body: JSON.stringify({
      input: {
        dummy_field: "test"
      }
    })
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
run();
