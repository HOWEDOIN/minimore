import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_MODULE } from "../../../../modules/content"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const contentModuleService = req.scope.resolve(CONTENT_MODULE)
  
  const announcements = await contentModuleService.listAnnouncements({
    is_active: true
  })
  
  // Return the first active announcement or null
  res.json({ announcement: announcements[0] || null })
}
