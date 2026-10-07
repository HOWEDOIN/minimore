const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://admin.minimore.my";

export interface SitewideSettings {
  hide_prices: boolean;
  disable_checkout: boolean;
  free_shipping: boolean;
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

export async function getSitewideSettings(): Promise<SitewideSettings> {
  try {
    const res = await fetch(`${WP_URL}/wp-json/minimore/v1/sitewide`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json() as Partial<SitewideSettings>;
      return {
        hide_prices: typeof data.hide_prices === "boolean" ? data.hide_prices : true,
        disable_checkout: typeof data.disable_checkout !== "undefined"
          ? Boolean(data.disable_checkout)
          : process.env.NEXT_PUBLIC_DISABLE_CHECKOUT !== "false",
        free_shipping: Boolean(data.free_shipping),
        announcement: data.announcement,
        social_instagram: data.social_instagram,
        social_facebook: data.social_facebook,
        social_tiktok: data.social_tiktok,
        social_telegram: data.social_telegram,
      };
    }
  } catch {
    // Silently fall through to defaults on network error
  }

  // Fallback defaults
  return {
    hide_prices: true,
    disable_checkout: process.env.NEXT_PUBLIC_DISABLE_CHECKOUT !== "false",
    free_shipping: false,
  };
}
