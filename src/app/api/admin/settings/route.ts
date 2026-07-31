import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

// Settings are persisted in a JSON file on the server filesystem.
// On Vercel, use a writable /tmp path; locally use the project root.
const SETTINGS_DIR = process.env.SETTINGS_DIR || "/tmp/minimore";
const SETTINGS_FILE = path.join(SETTINGS_DIR, "global-settings.json");
const ADMIN_TOKEN = process.env.MINIMORE_ADMIN_TOKEN || "minimore-admin";

interface GlobalSettings {
  hide_prices: boolean;
  disable_checkout: boolean;
}

const DEFAULT_SETTINGS: GlobalSettings = {
  hide_prices: false,
  disable_checkout: true,
};

async function readSettings(): Promise<GlobalSettings> {
  try {
    const raw = await readFile(SETTINGS_FILE, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function writeSettings(settings: GlobalSettings): Promise<void> {
  await mkdir(SETTINGS_DIR, { recursive: true });
  await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

function isAuthorized(req: NextRequest): boolean {
  const token =
    req.headers.get("x-admin-token") ||
    req.nextUrl.searchParams.get("token");
  return token === ADMIN_TOKEN;
}

export async function GET(req: NextRequest) {
  // Public read — used by sitewideSettings.ts to replace WP call
  const settings = await readSettings();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const current = await readSettings();
    const updated: GlobalSettings = {
      hide_prices: typeof body.hide_prices === "boolean" ? body.hide_prices : current.hide_prices,
      disable_checkout: typeof body.disable_checkout === "boolean" ? body.disable_checkout : current.disable_checkout,
    };
    await writeSettings(updated);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
