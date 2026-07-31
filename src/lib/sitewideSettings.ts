const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://admin.minimore.my";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://minimore.my";

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

export async function getSitewideSettings(): Promise<SitewideSettings> {
  // Fetch our own admin settings and WP sitewide in parallel
  const [adminRes, wpRes] = await Promise.allSettled([
    fetch(`${SITE_URL}/api/admin/settings`, { next: { revalidate: 30 } }),
    fetch(`${WP_URL}/wp-json/minimore/v1/sitewide`, { next: { revalidate: 60 } }),
  ]);

  let adminSettings: Partial<SitewideSettings> = {};
  if (adminRes.status === "fulfilled" && adminRes.value.ok) {
    try { adminSettings = await adminRes.value.json(); } catch {}
  }

  let wpSettings: Partial<SitewideSettings> = {};
  if (wpRes.status === "fulfilled" && wpRes.value.ok) {
    try { wpSettings = await wpRes.value.json(); } catch {}
  }

  // Our own admin settings take priority for toggles; WP provides social links & announcement
  return {
    hide_prices: adminSettings.hide_prices ?? wpSettings.hide_prices ?? false,
    disable_checkout: adminSettings.disable_checkout ?? wpSettings.disable_checkout ?? true,
    announcement: wpSettings.announcement,
    social_instagram: wpSettings.social_instagram,
    social_facebook: wpSettings.social_facebook,
    social_tiktok: wpSettings.social_tiktok,
    social_telegram: wpSettings.social_telegram,
  };
}

