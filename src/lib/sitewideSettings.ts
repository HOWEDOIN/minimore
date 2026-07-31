const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://admin.minimore.my";

export interface SitewideSettings {
  hide_prices: boolean;
  disable_checkout: boolean;
  announcement?: {
    is_active: boolean;
    text: string;
    link?: string;
  };
  social_instagram?: string;
  social_facebook?: string;
  social_tiktok?: string;
  social_telegram?: string;
}

let _cached: { data: SitewideSettings; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60_000; // 1 minute

export async function getSitewideSettings(): Promise<SitewideSettings> {
  const now = Date.now();
  if (_cached && now - _cached.fetchedAt < CACHE_TTL_MS) {
    return _cached.data;
  }

  try {
    const res = await fetch(`${WP_URL}/wp-json/minimore/v1/sitewide`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      const settings: SitewideSettings = {
        hide_prices: Boolean(data.hide_prices),
        disable_checkout: Boolean(data.disable_checkout),
        announcement: data.announcement,
        social_instagram: data.social_instagram,
        social_facebook: data.social_facebook,
        social_tiktok: data.social_tiktok,
        social_telegram: data.social_telegram,
      };
      _cached = { data: settings, fetchedAt: now };
      return settings;
    }
  } catch (e) {
    // Silently fall through to defaults on network error
  }

  // Default: show prices, disable checkout (safe defaults)
  return { hide_prices: false, disable_checkout: true };
}
