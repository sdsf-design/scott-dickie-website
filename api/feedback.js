// IceBreaker feedback (scott-dickie.com/icebreaker): emails what a visitor types in the
// Feedback form to Scott through Resend. Needs RESEND_API_KEY in the Vercel project.
// Until a domain is verified in Resend, mail can only come from onboarding@resend.dev
// and only go to the Resend account's own address, which is Scott's.

const TO = "scottddickie@gmail.com";
const FROM = "IceBreaker feedback <onboarding@resend.dev>";
const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?scott-dickie\.com$/,
  /^https:\/\/scott-dickie-website[a-z0-9-]*\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
];
const MAX_MESSAGE = 4000;
const MAX_FROM = 200;
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  // Only the site's own pages may send; a missing Origin (curl, bots) is turned away too
  const origin = req.headers.origin;
  if (!origin || !ALLOWED_ORIGINS.some((re) => re.test(origin))) {
    return res.status(403).json({ error: "forbidden" });
  }

  const { message, from = "", website = "", page = "IceBreaker" } = req.body || {};
  // "website" is a hidden field people never see; bots that fill every field get a quiet "ok"
  if (website) return res.status(200).json({ ok: true });
  if (typeof message !== "string" || !message.trim() || message.length > MAX_MESSAGE ||
      typeof from !== "string" || from.length > MAX_FROM) {
    return res.status(400).json({ error: "bad_message" });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ error: "not_configured" });
  }

  const sender = from.trim();
  const text = message.trim() + (sender ? `\n\nFrom: ${sender}` : "") + `\n\nSent from ${String(page).slice(0, 60)}`;
  const body = {
    from: FROM,
    to: [TO],
    subject: `${String(page).slice(0, 60)} feedback: ${message.trim().replace(/\s+/g, " ").slice(0, 50)}`,
    text,
    html: `<div style="font:16px/1.5 -apple-system, Helvetica, Arial, sans-serif; white-space:pre-wrap">${esc(text)}</div>`,
  };
  // A real email address lets Scott hit Reply and answer them directly
  if (EMAIL.test(sender)) body.reply_to = sender;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) return res.status(200).json({ ok: true });
    console.error("resend", r.status, await r.text());
    if (r.status === 401 || r.status === 403) return res.status(503).json({ error: "key_rejected" });
    if (r.status === 429) return res.status(429).json({ error: "rate_limited" });
    return res.status(502).json({ error: "upstream_error" });
  } catch (err) {
    console.error("resend", err);
    return res.status(502).json({ error: "upstream_error" });
  }
}
