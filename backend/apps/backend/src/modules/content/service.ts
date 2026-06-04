import { MedusaService } from "@medusajs/framework/utils"
import { Announcement } from "./models/announcement"
import { Page } from "./models/page"

class ContentModuleService extends MedusaService({
  Announcement,
  Page,
}) {
  // We can add custom methods here if needed, but MedusaService provides standard CRUD automatically!
}

export default ContentModuleService
