// LOC-1 (scott-dickie.com/location): takes a photo of a TV screen and asks Claude
// where the scene on screen was filmed. Needs ANTHROPIC_API_KEY in the Vercel project.
import Anthropic from "@anthropic-ai/sdk";

const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?scott-dickie\.com$/,
  /^https:\/\/scott-dickie-website[a-z0-9-]*\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
];
const MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BASE64 = 4_000_000; // ~3 MB image; the page sends a ~1600px JPEG

const PROMPT = `You are an expert in film and television filming locations and in geolocating photos.

The attached image is a phone photo of a TV, monitor or projector screen. Expect glare, moiré, a visible bezel, subtitles, channel logos or a pause bar. Ignore the room around the screen; look only at the picture on the screen.

Work out where the scene on screen was physically FILMED (the real place the camera stood), not just where the story is set. Use every clue: landmarks, skyline, architecture, street furniture, signage and language, road markings, which side traffic drives on, licence plates, vegetation, terrain, light, and the production itself if you recognise the show, film, actors or episode. If you know the production's documented filming locations, use them. If it was shot on a studio set, say so and give the studio's location.

Reply with only JSON in this shape:
{
  "title": string or null,               // show or film, with season/episode if you know it
  "scene": string,                       // what is on screen, under 20 words
  "fictional_setting": string or null,   // where the story says it is, if different
  "candidates": [                        // 1 to 3, most likely first
    {
      "place": string,                   // specific site, e.g. "Tower Bridge" or "Pinewood Studios, Stage 007"
      "area": string,                    // street or neighbourhood, city, region, country
      "lat": number, "lon": number,      // decimal degrees for that site
      "confidence": number,              // 0 to 1
      "precision": "exact" | "street" | "city" | "region" | "country",
      "why": string                      // the evidence, 1 to 2 sentences
    }
  ],
  "note": string or null                 // anything the viewer should know
}
If there is no screen or no readable scene, return "candidates": [] and explain in "note".`;

function parseJson(text) {
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a !== -1 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch {} }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.some((re) => re.test(origin))) {
    return res.status(403).json({ error: "forbidden" });
  }

  const { image, mediaType = "image/jpeg" } = req.body || {};
  if (typeof image !== "string" || !image || image.length > MAX_BASE64 || !MEDIA_TYPES.has(mediaType)) {
    return res.status(400).json({ error: "image_rejected" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "not_configured" });
  }

  try {
    const client = new Anthropic();
    const msg = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 8000,
      output_config: { effort: "high" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
          { type: "text", text: PROMPT },
        ],
      }],
    });

    if (msg.stop_reason === "refusal") return res.status(422).json({ error: "refused" });
    const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    const result = parseJson(text);
    if (!result) return res.status(502).json({ error: "invalid_json" });
    return res.status(200).json({ result });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "rate_limited" });
    if (err instanceof Anthropic.BadRequestError) return res.status(400).json({ error: "image_rejected" });
    if (err instanceof Anthropic.AuthenticationError) return res.status(503).json({ error: "key_rejected" });
    if (err instanceof Anthropic.PermissionDeniedError) return res.status(503).json({ error: "key_rejected" });
    console.error("locate failed", err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
    return res.status(502).json({ error: "upstream_error" });
  }
}
