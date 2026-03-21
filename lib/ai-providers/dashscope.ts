
/**
 * Alibaba DashScope (Wanx) Virtual Try-On Adapter
 * Handles asynchronous task submission and polling.
 */

export interface DashScopeVTORequest {
  modelImage: string; // URL or base64
  garmentImage: string; // URL or base64
  apiKey: string;
}

export interface DashScopeResponse {
  task_id: string;
  status: string;
  output_url?: string;
  error?: string;
}

export async function submitDashScopeVTO(req: DashScopeVTORequest): Promise<string> {
  const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/virtual-try-on/generation';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${req.apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable'
    },
    body: JSON.stringify({
      model: 'wanx-vto-v1', // Standard VTO model
      input: {
        model_image: req.modelImage,
        clothing_image: req.garmentImage
      },
      parameters: {
        resolution: 1024 // DashScope typically handles 1024 or 768
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'DashScope Task Submission Failed');
  }

  return data.output.task_id;
}

export async function pollDashScopeTask(taskId: string, apiKey: string): Promise<string> {
  const url = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
  const maxRetries = 30; // 30 retries * 2s = 60s max wait
  
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'DashScope Polling Failed');

    const status = data.output.task_status;
    if (status === 'SUCCEEDED') {
      return data.output.results[0].url;
    } else if (status === 'FAILED') {
      throw new Error(data.output.message || 'DashScope Task Failed');
    }

    // Wait 2 seconds before next poll
    await new Promise(r => setTimeout(r, 2000));
  }

  throw new Error('DashScope Task Timed Out');
}
