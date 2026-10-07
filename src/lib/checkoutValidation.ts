export const MALAYSIAN_STATES = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis",
  "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya",
] as const;

const EAST_MALAYSIA = new Set(["Sabah", "Sarawak", "Labuan"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTCODE = /^\d{5}$/;
const PHONE = /^(?:\+60|0)1\d{8,9}$/;

type Address = { firstName: string; lastName: string; address1: string; address2?: string; city: string; state: string; postcode: string; country: string };
type CheckoutBody = { contact: { email: string; phone?: string }; shipping: Address; billing?: Address | null; paymentMethod: string; cartItems: Array<{ variantId: string; quantity: number }> };

function validAddress(value: unknown): value is Address {
  if (!value || typeof value !== "object") return false;
  const a = value as Partial<Address>;
  return [a.firstName, a.lastName, a.address1, a.city].every((field) => typeof field === "string" && field.trim().length > 0) &&
    a.country === "MY" && typeof a.state === "string" && MALAYSIAN_STATES.includes(a.state as typeof MALAYSIAN_STATES[number]) &&
    typeof a.postcode === "string" && POSTCODE.test(a.postcode);
}

export function validateCheckoutBody(value: unknown): CheckoutBody | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Partial<CheckoutBody>;
  if (!body.contact || typeof body.contact.email !== "string" || !EMAIL.test(body.contact.email) ||
      body.paymentMethod !== "billplz" || !validAddress(body.shipping) ||
      (body.billing != null && !validAddress(body.billing)) || !Array.isArray(body.cartItems) ||
      body.cartItems.length < 1 || body.cartItems.length > 50) return null;

  const phone = body.contact.phone?.replace(/[\s()-]/g, "") || "";
  if (phone && !PHONE.test(phone)) return null;
  const normalizedPhone = phone.startsWith("0") ? `+60${phone.slice(1)}` : phone;
  const cartValid = body.cartItems.every((item) => item && /^\d+$/.test(String(item.variantId)) &&
    Number(item.variantId) > 0 && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 20);
  return cartValid ? { ...body, contact: { ...body.contact, phone: normalizedPhone || undefined } } as CheckoutBody : null;
}

export function shippingFor(state: string) {
  return EAST_MALAYSIA.has(state) ? 15 : 10;
}
