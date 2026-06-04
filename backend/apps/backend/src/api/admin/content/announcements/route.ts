import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../../modules/content"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const contentModuleService = req.scope.resolve(CONTENT_MODULE)
  const announcements = await contentModuleService.listAnnouncements()
  res.json({ announcement: announcements[0] || null })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const contentModuleService = req.scope.resolve(CONTENT_MODULE)
  const { text, link, is_active } = req.body as any
  
  const existing = await contentModuleService.listAnnouncements()
  
  let announcement;
  if (existing.length > 0) {
    announcement = await contentModuleService.updateAnnouncements({
      id: existing[0].id,
      text,
      link,
      is_active
    })
  } else {
    announcement = await contentModuleService.createAnnouncements({
      text,
      link,
      is_active
    })
  }
  
  res.json({ announcement })
}
