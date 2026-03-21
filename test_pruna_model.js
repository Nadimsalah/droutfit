async function testPruna() {
  const apiKey = "pru_AdE9f0Zx_wZMX8GJzqQjGvcB5CizoY5G";

  console.log("----- Test p-try-on model -----");
  let res = await fetch("https://api.pruna.ai/v1/predictions", {
    method: "POST",
    headers: { 
      "apikey": apiKey,
      "Content-Type": "application/json",
      "Model": "p-try-on"
    },
    body: JSON.stringify({
      input: {
        prompt: "Virtual try on",
        images: ["https://picsum.photos/200/300", "https://picsum.photos/200/300"]
      }
    })
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
testPruna();
