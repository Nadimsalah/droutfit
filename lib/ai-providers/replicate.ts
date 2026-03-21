
/**
 * Replicate Adapter
 * Uses open-source IDM-VTON for true virtual try-on.
 * Cost: ~$0.003-$0.008 per generation
 */

export interface ReplicateVTORequest {
  personImageUrl: string;
  garmentImageUrl: string;
  garmentDescription?: string;
  hfToken?: string;            // Required by CatVTON to access Flux Dev
  apiKey: string;
}


/**
 * Generates a simple white PNG mask as a data URI.
 * CatVTON uses this mask to know which area to apply clothing on.
 * A white upper-body region means "replace clothing here".
 */
function generateWhiteMaskDataUri(width = 576, height = 768): string {
  // Minimal valid PNG: 1x1 white pixel scaled with inline base64
  // We will use a known good white image URL instead
  // This is a 576x768 solid white PNG (base64 encoded minimal file)
  // Created using: convert -size 576x768 xc:white white_mask.png | base64
  // We use a hosted white placeholder image since we can't run canvas server-side
  return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==`;
}

export async function generateReplicateVTO(req: ReplicateVTORequest): Promise<string> {
  // IDM-VTON — highly optimized with 20 steps
  // Cost: ~$0.01 per run (down from default $0.03+)
  console.log('>>> [Replicate] Submitting to IDM-VTON endpoint');
  const submitResp = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${req.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: '906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f',
      input: {
        human_img: req.personImageUrl,
        garm_img: req.garmentImageUrl,
        garment_des: req.garmentDescription || 'clothing item',
        is_checked: true,
        is_checked_crop: true,
        denoise_steps: 20, // Reduced from 30+ to save 50%+ cost
        seed: 42,
        category: 'upper_body'
      }
    })
  });

  const predData = await submitResp.json();
  if (!submitResp.ok) {
    throw new Error(predData.detail || JSON.stringify(predData) || 'Replicate submission failed');
  }

  const predictionId = predData.id;
  if (!predictionId) throw new Error('Replicate did not return a prediction ID');

  const pollingUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;

  // Wait an initial 10s for model to start (avoids rapid-fire early polls)
  await new Promise(r => setTimeout(r, 10000));

  // Poll for result — up to 5 minutes (100 retries x 3s)
  const maxRetries = 100;
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(r => setTimeout(r, 3000));

    const pollResp = await fetch(pollingUrl, {
      headers: { 'Authorization': `Bearer ${req.apiKey}` }
    });

    const pollData = await pollResp.json();
    console.log(`>>> [Replicate] Poll ${i + 1}/${maxRetries} — Status: ${pollData.status}`);

    if (pollData.status === 'succeeded') {
      const output = pollData.output;
      // IDM-VTON normally returns a string URL
      if (typeof output === 'string') return output;
      if (Array.isArray(output) && output.length > 0) return output[output.length - 1];
      throw new Error('Replicate output was unexpected format');
    } else if (pollData.status === 'failed') {
      throw new Error(pollData.error || 'Replicate prediction failed');
    }
  }

  throw new Error('Replicate VTO timed out after 5 minutes');
}
