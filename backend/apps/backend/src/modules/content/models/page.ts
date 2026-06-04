import { model } from "@medusajs/framework/utils"

export const Page = model.define("page", {
  id: model.id().primaryKey(),
  title: model.text(),
  slug: model.text().unique(),
  content: model.text(), // This can be JSON string or raw HTML/Markdown
})
