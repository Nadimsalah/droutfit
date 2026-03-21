
import { client } from "@gradio/client";

export interface HFSpaceVTORequest {
  personImageUrl: string;
  garmentImageUrl: string;
  hfToken?: string;
}

const CANDIDATE_SPACES = [
  { id: "yisol/IDM-VTON", endpoint: "/tryon" },
  { id: "fashn-ai/fashn-vton-1.5", endpoint: "/try_on" },
  { id: "HumanAIGC/OutfitAnyone", endpoint: "/get_tryon_result" }
];

export async function generateHFSpaceVTO(req: HFSpaceVTORequest): Promise<string> {
  const hfToken = req.hfToken || process.env.HF_TOKEN;
  const errors: string[] = [];

  for (const space of CANDIDATE_SPACES) {
    try {
      console.log(`>>> [HF-Space] Trying: ${space.id}`);
      // In JS client, the auth property is 'token', not 'hf_token'
      const app = await client(space.id, { token: hfToken } as any);
      
      const [hB, gB] = await Promise.all([
        fetch(req.personImageUrl).then(r => r.blob()),
        fetch(req.garmentImageUrl).then(r => r.blob())
      ]);

      let result: any;

      if (space.id === "yisol/IDM-VTON") {
        result = await app.predict(space.endpoint, [
          { background: hB, layers: [], composite: null },
          gB,
          "A beautiful garment",
          true,
          true,
          20,
          42
        ]);
      } else if (space.id === "fashn-ai/fashn-vton-1.5") {
        result = await app.predict(space.endpoint, [
          hB,
          gB,
          "tops",
          "model",
          20,
          2.5,
          42,
          true
        ]);
      } else if (space.id === "HumanAIGC/OutfitAnyone") {
        // OutfitAnyone expects [model, top, bottom]
        result = await app.predict(space.endpoint, [
          hB,
          gB,
          null
        ]);
      }

      console.log(`>>> [HF-Space] Success with ${space.id}`);
      
      // Handle various Gradio result formats
      const data = result.data;
      if (Array.isArray(data) && data.length > 0) {
        const output = data[0];
        if (typeof output === "string") return output;
        if (output.url) return output.url;
        if (output.path && app.config) return app.config.root + "/file=" + output.path;
        if (output.path) return (app as any).config?.root + "/file=" + output.path;
      }
      
      errors.push(`${space.id}: Unexpected result format`);
    } catch (err: any) {
      const msg = err.message || JSON.stringify(err);
      console.warn(`>>> [HF-Space] Space ${space.id} failed: ${msg}`);
      errors.push(`${space.id}: ${msg}`);
    }
  }

  throw new Error(`FREE VTO failed on all candidates. Try again in 5 mins or check if your HF token is valid. Errors:\n${errors.join("\n")}`);
}
