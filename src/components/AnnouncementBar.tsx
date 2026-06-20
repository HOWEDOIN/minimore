import Link from "next/link";
import "./announcement.css";

export default async function AnnouncementBar() {
  let announcement = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WP_URL || "https://admin.minimore.my"}/wp-json/minimore/v1/sitewide`,
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const data = await res.json();
      announcement = data.announcement;
    }
  } catch (e) {
    // Silently fail — bar simply won't show
  }

  if (!announcement || !announcement.is_active || !announcement.text) {
    return null;
  }

  return (
    <div className="announcement-bar">
      {announcement.link ? (
        <Link href={announcement.link}>{announcement.text}</Link>
      ) : (
        <span>{announcement.text}</span>
      )}
    </div>
  );
}
