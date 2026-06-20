import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const Api = (WooCommerceRestApi as any).default || WooCommerceRestApi;

export const wooApi = new Api({
  url: process.env.NEXT_PUBLIC_WP_URL || "https://admin.minimore.my",
  consumerKey: process.env.MINIMORE_CONSUMER_KEY || "",
  consumerSecret: process.env.MINIMORE_SECRET || "",
  version: "wc/v3"
});
