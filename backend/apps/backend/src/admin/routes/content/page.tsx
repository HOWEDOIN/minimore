import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Container, Heading, Text, Input, Button, Textarea, Switch, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

// Define the route configuration so it appears in the sidebar
export const config = defineRouteConfig({
  label: "Content CMS",
  icon: DocumentText,
})

export default function ContentAdminPage() {
  const [announcementText, setAnnouncementText] = useState("")
  const [announcementLink, setAnnouncementLink] = useState("")
  const [announcementActive, setAnnouncementActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Pages state
  const [pages, setPages] = useState<any[]>([])
  const [pageTitle, setPageTitle] = useState("")
  const [pageSlug, setPageSlug] = useState("")
  const [pageContent, setPageContent] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch Announcement
      const annRes = await fetch("/admin/content/announcements")
      if (annRes.ok) {
        const { announcement } = await annRes.json()
        if (announcement) {
          setAnnouncementText(announcement.text || "")
          setAnnouncementLink(announcement.link || "")
          setAnnouncementActive(announcement.is_active || false)
        }
      }

      // Fetch Pages
      const pagesRes = await fetch("/admin/content/pages")
      if (pagesRes.ok) {
        const { pages } = await pagesRes.json()
        setPages(pages || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const saveAnnouncement = async () => {
    try {
      const res = await fetch("/admin/content/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: announcementText,
          link: announcementLink,
          is_active: announcementActive
        })
      })
      if (res.ok) {
        toast.success("Announcement saved")
      } else {
        toast.error("Failed to save announcement")
      }
    } catch (e) {
      toast.error("Network error")
    }
  }

  const createPage = async () => {
    if (!pageTitle || !pageSlug) return toast.error("Title and slug required")
    try {
      const res = await fetch("/admin/content/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageTitle,
          slug: pageSlug,
          content: pageContent
        })
      })
      if (res.ok) {
        toast.success("Page created")
        setPageTitle("")
        setPageSlug("")
        setPageContent("")
        fetchData()
      } else {
        toast.error("Failed to create page")
      }
    } catch (e) {
      toast.error("Network error")
    }
  }

  const deletePage = async (id: string) => {
    try {
      const res = await fetch(`/admin/content/pages/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("Page deleted")
        fetchData()
      }
    } catch (e) {
      toast.error("Network error")
    }
  }

  if (isLoading) return <Container><Text>Loading...</Text></Container>

  return (
    <div className="flex flex-col gap-y-4">
      <Container>
        <Heading level="h1" className="mb-4">Content CMS</Heading>
        <Text className="text-ui-fg-subtle mb-8">
          Manage your global announcement bar and static pages (FAQ, About Us, Contact) directly from Medusa.
        </Text>
      </Container>

      <Container>
        <Heading level="h2" className="mb-4">Announcement Bar</Heading>
        <div className="flex flex-col gap-y-4">
          <div>
            <Text size="small" weight="plus" className="mb-1">Announcement Text</Text>
            <Input 
              value={announcementText} 
              onChange={(e) => setAnnouncementText(e.target.value)} 
              placeholder="e.g. Free shipping on all orders over RM 150!" 
            />
          </div>
          <div>
            <Text size="small" weight="plus" className="mb-1">Link URL (Optional)</Text>
            <Input 
              value={announcementLink} 
              onChange={(e) => setAnnouncementLink(e.target.value)} 
              placeholder="e.g. /products?category=cosmetics" 
            />
          </div>
          <div className="flex items-center gap-x-2">
            <Switch checked={announcementActive} onCheckedChange={setAnnouncementActive} />
            <Text size="small">Active</Text>
          </div>
          <div>
            <Button onClick={saveAnnouncement}>Save Announcement</Button>
          </div>
        </div>
      </Container>

      <Container>
        <Heading level="h2" className="mb-4">Static Pages</Heading>
        
        <div className="mb-8 flex flex-col gap-y-4 border-b border-ui-border-base pb-8">
          <Heading level="h3">Create New Page</Heading>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text size="small" weight="plus" className="mb-1">Title</Text>
              <Input 
                value={pageTitle} 
                onChange={(e) => setPageTitle(e.target.value)} 
                placeholder="e.g. FAQ" 
              />
            </div>
            <div>
              <Text size="small" weight="plus" className="mb-1">URL Slug</Text>
              <Input 
                value={pageSlug} 
                onChange={(e) => setPageSlug(e.target.value)} 
                placeholder="e.g. faq" 
              />
            </div>
          </div>
          <div>
            <Text size="small" weight="plus" className="mb-1">HTML/Markdown Content</Text>
            <Textarea 
              value={pageContent} 
              onChange={(e) => setPageContent(e.target.value)} 
              placeholder="<h1>Frequently Asked Questions</h1><p>...</p>" 
              rows={6}
            />
          </div>
          <div>
            <Button onClick={createPage} variant="secondary">Create Page</Button>
          </div>
        </div>

        <div>
          <Heading level="h3" className="mb-4">Existing Pages</Heading>
          {pages.length === 0 ? (
            <Text className="text-ui-fg-subtle">No pages created yet.</Text>
          ) : (
            <div className="flex flex-col gap-y-2">
              {pages.map(page => (
                <div key={page.id} className="flex items-center justify-between p-4 border border-ui-border-base rounded-md">
                  <div>
                    <Text weight="plus">{page.title}</Text>
                    <Text size="small" className="text-ui-fg-subtle">/{page.slug}</Text>
                  </div>
                  <Button variant="danger" onClick={() => deletePage(page.id)}>Delete</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
