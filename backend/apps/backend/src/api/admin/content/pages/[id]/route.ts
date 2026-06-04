import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../../../modules/content"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const { title, slug, content } = req.body as any
  const contentModuleService = req.scope.resolve(CONTENT_MODULE)
  
  const page = await contentModuleService.updatePages({
    id,
    title,
    slug,
    content
  })
  
  res.json({ page })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const contentModuleService = req.scope.resolve(CONTENT_MODULE)
  
  await contentModuleService.deletePages(id)
  
  res.status(200).json({ success: true })
}
