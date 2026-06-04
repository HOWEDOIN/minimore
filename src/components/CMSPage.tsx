import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function CMSPage({ slug }: { slug: string }) {
  let page = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/content/pages/${slug}`, {
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_0e7bbc63441ebedf69546d625d74e638f999a21c4762d127ff320327ac101f1f"
      },
      next: { revalidate: 60 }
    });

    if (res.ok) {
      const data = await res.json();
      page = data.page;
    }
  } catch (e) {
    console.error("Failed to fetch page");
  }

  if (!page) {
    return notFound();
  }

  return (
    <>
      <Navbar isStatic={true} />
      <main style={{ background: 'var(--background)', minHeight: '60vh' }}>
        {/* Page Hero */}
        <div style={{
          background: 'linear-gradient(135deg, var(--background-alt) 0%, var(--primary-light) 100%)',
          padding: '5rem 0 4rem',
          borderBottom: '1px solid var(--border-light)',
          textAlign: 'center'
        }}>
          <div className="container">
            <p style={{
              fontSize: '0.7rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'var(--primary)',
              marginBottom: '1rem',
              fontWeight: 500
            }}>
              Minimore
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 4vw, 4rem)',
              fontWeight: 300,
              color: 'var(--foreground)',
              lineHeight: 1.15,
            }}>
              {page.title}
            </h1>
          </div>
        </div>

        {/* Page Content */}
        <div className="container" style={{ padding: '5rem 2rem 7rem', maxWidth: '780px' }}>
          <div
            className="cms-content"
            dangerouslySetInnerHTML={{ __html: page.content }}
            style={{
              lineHeight: '1.9',
              color: 'var(--text-secondary)',
              fontWeight: 300,
              fontSize: '1rem',
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
