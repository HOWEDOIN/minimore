import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import fs from "fs";
import path from "path";
import "./page.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pages = await fetch(`${process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my'}/wp-json/wp/v2/pages?slug=${slug}&_fields=title`).then(res => res.json());
  if (!pages || pages.length === 0) return { title: "Page Not Found - Minimore" };
  return { title: `${pages[0].title.rendered} - Minimore` };
}

export default async function StandardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my'}/wp-json/wp/v2/pages?slug=${slug}&_fields=title,content`, {
    next: { revalidate: 60 }
  });
  const pages = await res.json();

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
              dangerouslySetInnerHTML={{ __html: slug === 'faq' ? fs.readFileSync('/Users/hauiilee/.gemini/antigravity/brain/3c87b1bd-006f-42f8-9ce4-b0f223461bc1/scratch/faq_html.txt', 'utf8') : page.content.rendered }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

