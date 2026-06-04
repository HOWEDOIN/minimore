import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../../../modules/content"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { slug } = req.params
  const contentModuleService = req.scope.resolve(CONTENT_MODULE)
  
  const pages = await contentModuleService.listPages({
    slug: slug
  })
  
  if (!pages.length) {
    return res.status(404).json({ message: "Page not found" })
  }
  
  res.json({ page: pages[0] })
}
