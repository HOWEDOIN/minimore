import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import "./page.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === 'faq') {
    return { title: "FAQ - Minimore" };
  }

  let pages = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my'}/wp-json/wp/v2/pages?slug=${slug}&_fields=title`);
    if (res.ok) {
      pages = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch page metadata:", e);
  }

  if (!pages || pages.length === 0) return { title: "Page Not Found - Minimore" };
  return { title: `${pages[0].title.rendered} - Minimore` };
}

export default async function StandardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let pages = [];
  if (slug === 'faq') {
    pages = [{
      title: { rendered: "Frequently Asked Questions" },
      content: { rendered: "" }
    }];
  } else {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my'}/wp-json/wp/v2/pages?slug=${slug}&_fields=title,content`, {
        next: { revalidate: 60 }
      });
      if (res.ok) {
        pages = await res.json();
      }
    } catch (e) {
      console.error("Failed to fetch page content:", e);
    }
  }

  if (!pages || pages.length === 0) {
    notFound();
  }

  const page = pages[0];

  // Map slugs to a friendly eyebrow label
  const eyebrowMap: Record<string, string> = {
    about: "The Minimore Story",
    faq: "",
    contact: "We'd Love to Hear From You",
  };
  const eyebrow = eyebrowMap[slug] || "Minimore";

  return (
    <div className={`standard-page page-wrapper page-${slug}`}>
      <Navbar isStatic />

      {/* ── Page Hero ── */}
      <section className="standard-page-hero">
        <div className="container">
          <span className="standard-page-eyebrow">{eyebrow}</span>
          <h1
            className="standard-page-title"
            dangerouslySetInnerHTML={{ __html: page.title.rendered }}
          />
        </div>
      </section>

      {/* ── Page Content ── */}
      <section className="standard-page-body">
        <div className="container">
          <div className="standard-page-content">
            <div
              className="wp-content"
              dangerouslySetInnerHTML={{ __html: slug === 'faq' ? require('@/data/faq.json').map((p: any) => `<p><strong>${p.q}</strong>${p.a}</p>`).join('\n') : page.content.rendered }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

