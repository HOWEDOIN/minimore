import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { linkSalesChannelsToApiKeyWorkflow } from "@medusajs/medusa/core-flows"

export default async function createPubKey({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const apiKeyModuleService = container.resolve(Modules.API_KEY)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

  logger.info("Creating publishable API key...")
  
  const apiKey = await apiKeyModuleService.createApiKeys({
    title: "Storefront Key",
    type: "publishable",
    created_by: "system",
  })
  
  const salesChannels = await salesChannelModuleService.listSalesChannels()
  
  if (salesChannels.length > 0) {
    logger.info("Linking to sales channel...")
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: apiKey.id,
        add: [salesChannels[0].id]
      }
    })
  }

  console.log(`\n\n=== YOUR PUBLISHABLE KEY ===\n${apiKey.token}\n============================\n\n`)
}
