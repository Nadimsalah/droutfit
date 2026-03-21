
/**
 * SiliconFlow Adapter
 * Ultra-cheap Chinese AI image generation.
 */

export interface SiliconFlowRequest {
  model: string;
  prompt: string;
  imageUrls: string[]; // [person, garment]
  apiKey: string;
}

export async function generateSiliconFlow(req: SiliconFlowRequest): Promise<string> {
  const url = 'https://api.siliconflow.cn/v1/images/generations';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${req.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: req.model || 'black-forest-labs/FLUX.1-schnell',
      prompt: req.prompt,
      negative_prompt: "nude, naked, blurry, low resolution, deformed, distorted body",
      image_size: "1024x1024",
      batch_size: 1,
      num_inference_steps: 20,
      guidance_scale: 7.5
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || JSON.stringify(data) || 'SiliconFlow Generation Failed');
  }

  if (!data.images || data.images.length === 0) {
    throw new Error('SiliconFlow did not return any images.');
  }

  return data.images[0].url;
}
