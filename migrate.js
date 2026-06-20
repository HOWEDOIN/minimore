const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const fs = require('fs');

const wooCommerce = new WooCommerceRestApi({
  url: "http://minimore.local",
  consumerKey: process.env.MINIMORE_CONSUMER_KEY,
  consumerSecret: process.env.MINIMORE_SECRET,
  version: "wc/v3"
});

async function migrate() {
  try {
    // 1. Verify WooCommerce Connection
    console.log("Verifying WooCommerce connection...");
    const { data: wooProducts } = await wooCommerce.get("products");
    console.log(`Successfully connected! Found ${wooProducts.length} existing products in WooCommerce.`);

    // 2. Fetch Medusa Products
    console.log("Fetching Medusa products...");
    const medusaRes = await fetch("http://localhost:9000/store/products?limit=100", {
      headers: {
        "x-publishable-api-key": "pk_0e7bbc63441ebedf69546d625d74e638f999a21c4762d127ff320327ac101f1f"
      }
    });
    
    if (!medusaRes.ok) throw new Error("Failed to fetch Medusa products. Is Medusa running?");
    
    const { products: medusaProducts } = await medusaRes.json();
    console.log(`Found ${medusaProducts.length} products in Medusa to migrate.`);

    // 3. Migrate Products
    for (const product of medusaProducts) {
      console.log(`Migrating: ${product.title}...`);
      
      const price = product.variants && product.variants[0] && product.variants[0].prices && product.variants[0].prices[0]
        ? (product.variants[0].prices[0].amount / 100).toString()
        : "10.00";

      const wooProductData = {
        name: product.title,
        type: "simple",
        regular_price: price,
        description: product.description || "",
        short_description: product.subtitle || "",
        categories: []
      };

      await wooCommerce.post("products", wooProductData);
      console.log(`✅ Successfully migrated ${product.title}`);
    }

    console.log("Migration complete!");
    
  } catch (error) {
    console.error("Migration failed:");
    console.error(error.response ? error.response.data : error.message);
  }
}

migrate();
