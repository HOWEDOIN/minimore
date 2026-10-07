import { createHmac, timingSafeEqual } from "node:crypto";

const normalizeKey = (key: string) => key.replace(/[\[\]]/g, "");

export function verifyBillplzSignature(params: URLSearchParams, key = process.env.BILLPLZ_X_SIGNATURE_KEY) {
  if (!key) return false;
  const supplied = params.get("x_signature") || params.get("billplz[x_signature]");
  if (!supplied) return false;
  const source = [...params.entries()]
    .filter(([name]) => !normalizeKey(name).toLowerCase().endsWith("x_signature"))
    .map(([name, value]) => `${normalizeKey(name)}${value}`)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .join("|");
  const expected = createHmac("sha256", key).update(source).digest("hex");
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
