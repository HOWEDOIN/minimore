import Link from "next/link";
import "./announcement.css";

export default async function AnnouncementBar() {
  let announcement = null;
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/content/announcements`, {
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_0e7bbc63441ebedf69546d625d74e638f999a21c4762d127ff320327ac101f1f"
      },
      next: { revalidate: 60 } // Revalidate every minute
    });
    
    if (res.ok) {
      const data = await res.json();
      announcement = data.announcement;
    }
  } catch (e) {
    console.error("Failed to fetch announcement");
  }

  if (!announcement || !announcement.is_active) {
    return null;
  }

  return (
    <div className="announcement-bar">
      {announcement.link ? (
        <Link href={announcement.link}>
          {announcement.text}
        </Link>
      ) : (
        <span>{announcement.text}</span>
      )}
    </div>
  );
}
