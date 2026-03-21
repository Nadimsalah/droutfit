
/**
 * Fal.ai Adapter
 * Uses flux-klein-9b-virtual-tryon-lora for ultra-realistic VTO.
 * Cost: ~$0.012 per image (1x megapixel at $0.012/MP)
 */

const FAL_LORA_WEIGHTS = 'https://huggingface.co/fal/flux-klein-9b-virtual-tryon-lora/resolve/main/flux-klein-tryon.safetensors';
const FAL_MODEL_ID = 'fal-ai/flux-2/klein/9b/base/edit/lora';

export interface FalVTORequest {
  personImageUrl: string;
  garmentImageUrl: string;
  personDescription?: string;
  apiKey: string;
}

export async function generateFalVTO(req: FalVTORequest): Promise<string> {
  const personDesc = req.personDescription || 'a person standing naturally';
  const prompt = `TRYON ${personDesc}. Replace the top garment with the one shown in the reference image. Keep the same pose, lighting, and background. The final image is a full body shot.`;

  // Submit the job to fal.ai queue
  const submitResp = await fetch(`https://queue.fal.run/${FAL_MODEL_ID}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${req.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      image_urls: [
        req.personImageUrl,   // [0] = person
        req.garmentImageUrl,  // [1] = top garment
      ],
      loras: [{
        path: FAL_LORA_WEIGHTS,
        scale: 1.0
      }],
      num_inference_steps: 28,
      guidance_scale: 2.5
    })
  });

  const submitData = await submitResp.json();
  if (!submitResp.ok) {
    throw new Error(submitData.detail || submitData.message || 'fal.ai submission failed');
  }

  // Get the request ID for polling
  const requestId = submitData.request_id;
  if (!requestId) throw new Error('fal.ai did not return a request_id');

  console.log(`>>> [fal.ai] Submitted job: ${requestId}`);

  // Poll for result — fal.ai status endpoint
  const statusUrl = `https://queue.fal.run/${FAL_MODEL_ID}/requests/${requestId}/status`;
  const resultUrl = `https://queue.fal.run/${FAL_MODEL_ID}/requests/${requestId}`;

  const maxRetries = 100; // up to 5 minutes
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(r => setTimeout(r, 3000));

    const statusResp = await fetch(statusUrl, {
      headers: { 'Authorization': `Key ${req.apiKey}` }
    });

    const status = await statusResp.json();
    console.log(`>>> [fal.ai] Poll ${i + 1} — Status: ${status.status}`);

    if (status.status === 'COMPLETED') {
      // Fetch the actual result
      const resultResp = await fetch(resultUrl, {
        headers: { 'Authorization': `Key ${req.apiKey}` }
      });
      const result = await resultResp.json();
      const img = result.images?.[0]?.url;
      if (img) return img;
      throw new Error('fal.ai returned no images');
    } else if (status.status === 'FAILED') {
      throw new Error(status.error || 'fal.ai prediction failed');
    }
  }

  throw new Error('fal.ai VTO timed out after 5 minutes');
}
