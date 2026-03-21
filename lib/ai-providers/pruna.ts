
/**
 * Pruna AI Adapter
 * Integration for P-API (p-image, p-image-edit)
 */

export interface PrunaVTORequest {
  personImageUrl: string;
  garmentImageUrl: string;
  garmentDescription?: string;
  apiKey: string;
}

interface PrunaFileUploadResponse {
  id: string;
  urls: {
    get: string;
  };
}

interface PrunaPredictionResponse {
  id: string;
  status: string;
  generation_url?: string;
  message?: string;
  error?: string;
}

/**
 * Downloads an image from a URL and uploads it to Pruna AI files
 */
async function uploadToPruna(imageUrl: string, apiKey: string): Promise<string> {
  console.log(`>>> [Pruna] Fetching image for upload: ${imageUrl.substring(0, 50)}...`);
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  const blob = await response.blob();

  const formData = new FormData();
  formData.append("content", blob, "image.jpg");

  console.log(`>>> [Pruna] Initializing upload to: https://api.pruna.ai/v1/files`);
  const uploadResp = await fetch("https://api.pruna.ai/v1/files", {
    method: "POST",
    headers: {
      "apikey": apiKey,
      "Accept": "application/json"
    },
    body: formData
  });

  console.log(`>>> [Pruna] Upload Status: ${uploadResp.status} ${uploadResp.statusText}`);

  if (!uploadResp.ok) {
    const errText = await uploadResp.text();
    throw new Error(`Pruna upload failed: ${errText}`);
  }

  const data = (await uploadResp.json()) as PrunaFileUploadResponse;
  return data.urls.get;
}

export async function generatePrunaVTO(req: PrunaVTORequest): Promise<string> {
  // Ensure URLs are absolute for both fetch and Pruna
  const fixUrl = (url: string) => url.startsWith('//') ? 'https:' + url : url;
  const pImg = fixUrl(req.personImageUrl);
  const gImg = fixUrl(req.garmentImageUrl);

  console.log(`>>> [Pruna] Starting VTO with images: Person=${pImg.substring(0, 50)}..., Garment=${gImg.substring(0, 50)}...`);

  // 1. Upload both images to Pruna
  // Some P-API models require referencing internal file IDs
  const [personFileUrl, garmentFileUrl] = await Promise.all([
    uploadToPruna(pImg, req.apiKey),
    uploadToPruna(gImg, req.apiKey)
  ]);

  console.log(`>>> [Pruna] Files ready: P=${personFileUrl}, G=${garmentFileUrl}`);

  // 2. Submit prediction
  const prompt = req.garmentDescription 
    ? `Virtual try-on: Change the clothing on the person in the second image to exactly match the garment in the first image. ${req.garmentDescription}`
    : "Virtual try-on: Change the clothing on the person in the second image to match the garment shown in the first image. Photorealistic, seamless blending.";

  const submitResp = await fetch("https://api.pruna.ai/v1/predictions", {
    method: "POST",
    headers: {
      "apikey": req.apiKey,
      "Content-Type": "application/json",
      "Model": "p-image-edit",
      "Try-Sync": "true" // Prefer immediate result if available
    },
    body: JSON.stringify({
      input: {
        prompt: prompt,
        images: [garmentFileUrl, personFileUrl],
        aspect_ratio: "match_input_image",
        turbo: false
      }
    })
  });

  const submitData = (await submitResp.json()) as any;
  if (!submitResp.ok) {
    console.error(">>> [Pruna] Prediction submission failed:", submitData);
    throw new Error(submitData.message || JSON.stringify(submitData) || "Pruna submission failed");
  }

  // If it returned a generation_url immediately (sync mode)
  if (submitData.generation_url) {
    console.log(">>> [Pruna] Received immediate result URL");
    return submitData.generation_url;
  }

  const predictionId = submitData.id;
  if (!predictionId) {
    throw new Error("Pruna did not return a prediction ID and no immediate result.");
  }

  // 3. Polling for async result
  const statusUrl = `https://api.pruna.ai/v1/predictions/status/${predictionId}`;
  const maxRetries = 60;
  
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const pollResp = await fetch(statusUrl, {
      headers: { "apikey": req.apiKey }
    });

    if (!pollResp.ok) continue;

    const pollData = (await pollResp.json()) as PrunaPredictionResponse;
    if (pollData.status === "succeeded" && pollData.generation_url) {
      return pollData.generation_url;
    } else if (pollData.status === "failed") {
      throw new Error(pollData.message || pollData.error || "Pruna prediction failed");
    }
  }

  throw new Error("Pruna VTO timed out after 2 minutes");
}
