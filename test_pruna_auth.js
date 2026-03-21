async function testPruna() {
  const apiKey = "pru_AdE9f0Zx_wZMX8GJzqQjGvcB5CizoY5G";

  console.log("----- apikey -----");
  let res1 = await fetch("https://api.pruna.ai/v1/files", {
    method: "POST",
    headers: { "apikey": apiKey }
  });
  console.log("apikey status:", res1.status);
  console.log("apikey body:", await res1.text());

  console.log("----- Authorization Bearer -----");
  let res2 = await fetch("https://api.pruna.ai/v1/files", {
    method: "POST",
    headers: { "Authorization": "Bearer " + apiKey }
  });
  console.log("Bearer status:", res2.status);
  console.log("Bearer body:", await res2.text());
}
testPruna();
