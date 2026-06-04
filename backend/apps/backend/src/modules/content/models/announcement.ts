import { model } from "@medusajs/framework/utils"

export const Announcement = model.define("announcement", {
  id: model.id().primaryKey(),
  text: model.text(),
  link: model.text().nullable(),
  is_active: model.boolean().default(false),
})
