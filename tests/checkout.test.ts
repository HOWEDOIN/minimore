import assert from "node:assert/strict";
import test from "node:test";
import { shippingFor, validateCheckoutBody } from "../src/lib/checkoutValidation.ts";

const valid = {
  contact: { email: "buyer@example.com" }, paymentMethod: "billplz",
  shipping: { firstName: "A", lastName: "B", address1: "1 Road", city: "KL", state: "Selangor", postcode: "50000", country: "MY" },
  cartItems: [{ variantId: "12", quantity: 2 }],
};

test("checkout accepts Malaysia only and selects regional shipping", () => {
  assert.ok(validateCheckoutBody(valid));
  assert.equal(shippingFor("Selangor"), 10);
  assert.equal(shippingFor("Sabah"), 15);
  assert.equal(validateCheckoutBody({ ...valid, shipping: { ...valid.shipping, country: "SG" } }), null);
  assert.equal(validateCheckoutBody({ ...valid, paymentMethod: "cod" }), null);
});
