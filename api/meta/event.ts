import { createHash } from "crypto";

const META_PIXEL_ID = "3390105951260014";
const META_CAPI_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashUserField(value: string | undefined): string[] {
  if (!value || !value.trim()) return [];
  return [sha256(value.toLowerCase().trim())];
}

function hashPhone(value: string | undefined): string[] {
  if (!value || !value.trim()) return [];
  let phone = value.replace(/\s+/g, "");
  if (phone.startsWith("0")) phone = "+61" + phone.slice(1);
  return [sha256(phone)];
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn("[meta-capi] META_ACCESS_TOKEN not set — skipping");
    return res.status(200).json({ skipped: true, reason: "META_ACCESS_TOKEN not configured" });
  }

  const { eventName, eventId, eventSourceUrl, userData, customData } = req.body ?? {};

  if (!eventName || !eventId) {
    return res.status(400).json({ error: "eventName and eventId are required" });
  }

  const hashedUserData: Record<string, unknown> = {};
  const em = hashUserField(userData?.email);
  const ph = hashPhone(userData?.phone);
  const fn = hashUserField(userData?.firstName);
  const ln = hashUserField(userData?.lastName);
  if (em.length) hashedUserData.em = em;
  if (ph.length) hashedUserData.ph = ph;
  if (fn.length) hashedUserData.fn = fn;
  if (ln.length) hashedUserData.ln = ln;

  const forwarded = req.headers["x-forwarded-for"];
  const clientIp = typeof forwarded === "string"
    ? forwarded.split(",")[0].trim()
    : "";
  const userAgent = req.headers["user-agent"] ?? "";
  if (clientIp) hashedUserData.client_ip_address = clientIp;
  if (userAgent) hashedUserData.client_user_agent = userAgent;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl ?? "",
        action_source: "website",
        user_data: hashedUserData,
        custom_data: customData ?? {},
      },
    ],
    access_token: accessToken,
  };

  try {
    const capiUrl = `https://graph.facebook.com/${META_CAPI_VERSION}/${META_PIXEL_ID}/events`;
    const capiRes = await fetch(capiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await capiRes.json() as Record<string, unknown>;

    if (!capiRes.ok) {
      console.error("[meta-capi] Facebook API error:", JSON.stringify(result));
      return res.status(502).json({ error: "Meta CAPI upstream error", detail: result });
    }

    console.log(`[meta-capi] ${eventName} sent (id=${eventId})`);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("[meta-capi] Network error:", err);
    return res.status(502).json({ error: "Failed to reach Meta CAPI" });
  }
}
