import { ExecArgs } from "@medusajs/framework/types"
import { createProductsWorkflow, createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"

export default async function seedMockData({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const productModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

  logger.info("Fetching existing products...")
  const products = await productModuleService.listProducts({}, { select: ["id"] })
  if (products.length > 0) {
    logger.info(`Deleting ${products.length} existing products...`)
    await productModuleService.softDeleteProducts(products.map(p => p.id))
  }

  logger.info("Fetching default sales channel...")
  const salesChannels = await salesChannelModuleService.listSalesChannels()
  const defaultSalesChannel = salesChannels[0]

  logger.info("Creating new categories...")
  const categoryInput = [
    { name: "Cosmetics", is_active: true },
    { name: "Skin Care", is_active: true },
    { name: "Fragrances", is_active: true },
    { name: "Best Seller", is_active: true },
    { name: "New Arrivals", is_active: true },
  ]
  const { result: createdCategories } = await createProductCategoriesWorkflow(container).run({
    input: { product_categories: categoryInput }
  })

  logger.info("Generating mock products...")
  const mockProducts = [
    {
      title: "Dior Mini Perfume Set",
      description: "A luxurious 5-piece travel set featuring Dior's signature scents.",
      options: [{ title: "Size", values: ["Set of 5"] }],
      variants: [{
        title: "Set of 5",
        options: { Size: "Set of 5" },
        prices: [{ amount: 450, currency_code: "myr" }],
        manage_inventory: true,
      }],
      metadata: {
        size_ml: "5x 5ml",
        condition: "Brand New Boxed",
        expiry_date: "2028-12-01",
        gwp_notes: "Includes free Dior pouch"
      },
      categories: [{ id: createdCategories.find(c => c.name === "Fragrances")!.id }],
      sales_channels: [{ id: defaultSalesChannel.id }]
    },
    {
      title: "Chanel No. 5 L'Eau",
      description: "A modern, fresh and vibrant version of the classic Chanel No. 5.",
      options: [{ title: "Size", values: ["50ml", "100ml"] }],
      variants: [
        {
          title: "50ml",
          options: { Size: "50ml" },
          prices: [{ amount: 650, currency_code: "myr" }],
          manage_inventory: true,
        },
        {
          title: "100ml",
          options: { Size: "100ml" },
          prices: [{ amount: 890, currency_code: "myr" }],
          manage_inventory: true,
        }
      ],
      metadata: {
        size_ml: "50ml / 100ml",
        condition: "Brand New Sealed",
        expiry_date: "2029-01-15",
        gwp_notes: "None"
      },
      categories: [
        { id: createdCategories.find(c => c.name === "Fragrances")!.id },
        { id: createdCategories.find(c => c.name === "Best Seller")!.id }
      ],
      sales_channels: [{ id: defaultSalesChannel.id }]
    },
    {
      title: "YSL Rouge Pur Couture Lipstick",
      description: "Rich, luxurious color in a satin finish.",
      options: [{ title: "Shade", values: ["1 Le Rouge", "19 Le Fuchsia"] }],
      variants: [
        {
          title: "1 Le Rouge",
          options: { Shade: "1 Le Rouge" },
          prices: [{ amount: 160, currency_code: "myr" }],
          manage_inventory: true,
        },
        {
          title: "19 Le Fuchsia",
          options: { Shade: "19 Le Fuchsia" },
          prices: [{ amount: 160, currency_code: "myr" }],
          manage_inventory: true,
        }
      ],
      metadata: {
        size_ml: "3.8g",
        condition: "Brand New Boxed",
        expiry_date: "2027-11-20",
        gwp_notes: "GWP Mini Mirror included"
      },
      categories: [
        { id: createdCategories.find(c => c.name === "Cosmetics")!.id },
        { id: createdCategories.find(c => c.name === "New Arrivals")!.id }
      ],
      sales_channels: [{ id: defaultSalesChannel.id }]
    },
    {
      title: "La Mer Crème de la Mer",
      description: "The moisturizer that started it all. Rich, soothing, and deeply hydrating.",
      options: [{ title: "Size", values: ["30ml", "60ml"] }],
      variants: [
        {
          title: "30ml",
          options: { Size: "30ml" },
          prices: [{ amount: 980, currency_code: "myr" }],
          manage_inventory: true,
        },
        {
          title: "60ml",
          options: { Size: "60ml" },
          prices: [{ amount: 1750, currency_code: "myr" }],
          manage_inventory: true,
        }
      ],
      metadata: {
        size_ml: "30ml / 60ml",
        condition: "Brand New Boxed",
        expiry_date: "2027-05-10",
        gwp_notes: "Free spatula included"
      },
      categories: [{ id: createdCategories.find(c => c.name === "Skin Care")!.id }],
      sales_channels: [{ id: defaultSalesChannel.id }]
    }
  ]

  logger.info("Running create products workflow...")
  await createProductsWorkflow(container).run({
    input: { products: mockProducts }
  })

  logger.info("Successfully seeded mock cosmetic and fragrance products!")
}
