import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../../modules/content"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const contentModuleService = req.scope.resolve(CONTENT_MODULE)
  const pages = await contentModuleService.listPages()
  res.json({ pages })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const contentModuleService = req.scope.resolve(CONTENT_MODULE)
  const { title, slug, content } = req.body as any
  
  const page = await contentModuleService.createPages({
    title,
    slug,
    content
  })
  
  res.json({ page })
}
