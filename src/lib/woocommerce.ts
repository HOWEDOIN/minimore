const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://admin.minimore.my";

export const wooApi = {
  async get(path: string, params: Record<string, string | number | boolean> = {}) {
    const url = new URL(`/wp-json/wc/v3/${path}`, WP_URL);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.MINIMORE_CONSUMER_KEY || ""}:${process.env.MINIMORE_SECRET || ""}`).toString("base64")}`,
      },
      ...(path.startsWith("orders") ? { cache: "no-store" as const } : { next: { revalidate: 60 } }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || `WooCommerce request failed (${response.status})`);
    return { data, totalPages: Number(response.headers.get("x-wp-totalpages") || 1) };
  },

  async getAll(path: string, params: Record<string, string | number | boolean> = {}) {
    const first = await this.get(path, { per_page: 100, ...params, page: 1 });
    if (!Array.isArray(first.data) || first.totalPages <= 1) {
      return { data: first.data };
    }
    const maxPages = Math.min(first.totalPages, 10);
    const rest = await Promise.all(
      Array.from({ length: maxPages - 1 }, (_, idx) =>
        this.get(path, { per_page: 100, ...params, page: idx + 2 }).catch(() => ({ data: [] }))
      )
    );
    return { data: [first.data, ...rest.map((r) => (Array.isArray(r.data) ? r.data : []))].flat() };
  },
};
