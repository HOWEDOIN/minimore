import CMSPage from "@/components/CMSPage";

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <CMSPage slug={resolvedParams.slug} />;
}
