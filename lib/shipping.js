import { wcApi } from "@/lib/woocommerce";

// Shipping options come from the WooCommerce shipping zone for India so prices are maintained in
// one place (WooCommerce admin) instead of being repeated in the storefront code.
// Server-only. Results are cached for a few minutes; the defaults match the current WordPress setup
// and are only used if WooCommerce cannot be reached.

const FALLBACK = {
  standard: { id: "standard", methodId: "flat_rate", title: "Standard Shipping", cost: 80 },
  express: { id: "express", methodId: "flat_rate", title: "Express Shipping", cost: 250 },
};

const CACHE_MS = 5 * 60 * 1000;
let cache = null;

export async function getShippingOptions() {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;

  try {
    const zonesRes = await wcApi.get("shipping/zones");
    const zone = (zonesRes.data || []).find((z) => z.id !== 0 && /india/i.test(z.name)) ||
      (zonesRes.data || []).find((z) => z.id !== 0);
    if (!zone) throw new Error("No shipping zone configured");

    const methodsRes = await wcApi.get(`shipping/zones/${zone.id}/methods`);
    const methods = (methodsRes.data || []).filter((m) => m.enabled && m.method_id === "flat_rate");

    const pick = (pattern, fallback) => {
      const m = methods.find((x) => pattern.test(x.title));
      const cost = Number.parseFloat(m?.settings?.cost?.value);
      return m && Number.isFinite(cost)
        ? { ...fallback, title: m.title, cost }
        : fallback;
    };

    const value = {
      standard: pick(/standard/i, FALLBACK.standard),
      express: pick(/express/i, FALLBACK.express),
    };
    cache = { at: Date.now(), value };
    return value;
  } catch (err) {
    console.warn("Shipping options fallback in use:", err?.response?.data?.message || err?.message);
    return cache?.value || FALLBACK;
  }
}
